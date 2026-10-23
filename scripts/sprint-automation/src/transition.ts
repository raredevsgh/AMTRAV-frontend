import { trustedAuthors, type ValidatedSprint, type ValidatedSprintFile } from "./definition.ts";
import { evaluateSprintCompletion } from "./evaluate.ts";
import type { GitHubClient, GitHubComment, GitHubIssue } from "./gh.ts";
import { readyToStartMarker, sprintIssueMarker, taskIssueMarker } from "./markers.ts";

export interface ProposeResult {
  sprintIssueNumber: number;
  taskIssueNumbers: Record<string, number>;
  readyToStartCommentCreated: boolean;
}

export interface ActivationResult {
  activated: boolean;
  currentAgreements: number;
  requiredAgreements: number;
  approvers: string[];
  reasons: string[];
}

function findReadyToStartComment(file: ValidatedSprintFile, sprintId: string, comments: GitHubComment[]) {
  const marker = readyToStartMarker(sprintId);
  const trusted = trustedAuthors(file);
  return comments.find((c) => c.body.includes(marker) && trusted.includes(c.author.login));
}

function activationRequirements(file: ValidatedSprintFile, sprint: ValidatedSprint): string[] {
  const lines: string[] = [];
  if (file.activation_agreements > 0) {
    lines.push(`- **${file.activation_agreements} collaborator 👍 reactions** on this comment.`);
  }
  if (sprint.risk_level === 3) {
    lines.push(`- Because this is a **Risk Level 3** sprint, a 👍 from \`${file.approvers.join(", ")}\` on this comment.`);
  }
  return lines;
}

export async function proposeSprint(
  file: ValidatedSprintFile,
  sprint: ValidatedSprint,
  gh: GitHubClient
): Promise<ProposeResult> {
  const sprintMarker = sprintIssueMarker(sprint.id);
  let sprintIssue = await gh.findIssueByMarker(sprintMarker);
  let sprintIssueNumber: number;

  const bodyLines = [
    sprintMarker,
    `## Sprint Objective`,
    sprint.objective,
    ``,
    `### Details`,
    `- **Risk Level**: Level ${sprint.risk_level}`,
    `- **Order**: ${sprint.order}`,
    `- **Effort**: ${sprint.effort || "TBD"}`,
    `- **Exit Gate**: ${sprint.exit_gate || "Standard exit gate"}`,
    ``,
    `### Acceptance Criteria`,
    ...(sprint.acceptance_criteria || []).map((ac) => `- [ ] ${ac}`),
    ``,
    `### Tasks`,
    ...(sprint.task || []).map((t) => `- [ ] **${t.key}**: ${t.title}`),
  ];
  const fullSprintBody = bodyLines.join("\n");

  if (sprintIssue) {
    sprintIssueNumber = sprintIssue.number;
    await gh.updateIssueBody(sprintIssueNumber, fullSprintBody);
    console.log(`Updated sprint issue #${sprintIssueNumber} for ${sprint.id}`);
  } else {
    const title = `${sprint.title} (${sprint.id})`;
    sprintIssueNumber = await gh.createIssue(
      title,
      fullSprintBody,
      sprint.assignees,
      ["sprint", `risk:level-${sprint.risk_level}`]
    );
    console.log(`Created sprint issue #${sprintIssueNumber} for ${sprint.id}`);
  }

  // Create task issues idempotently
  const taskIssueNumbers: Record<string, number> = {};
  for (const t of sprint.task || []) {
    const tMarker = taskIssueMarker(t.key);
    const existingTask = await gh.findIssueByMarker(tMarker);
    const taskTitle = `[${t.key}] ${t.title}`;
    const taskBody = [
      tMarker,
      `Part of Sprint Issue #${sprintIssueNumber} (${sprint.id}).`,
      ``,
      `### Task Description`,
      t.title,
      ``,
      `- **Required**: ${t.required !== false ? "Yes" : "No"}`,
    ].join("\n");

    if (existingTask) {
      taskIssueNumbers[t.key] = existingTask.number;
      await gh.updateIssueBody(existingTask.number, taskBody);
      console.log(`Updated task issue #${existingTask.number} for task ${t.key}`);
    } else {
      const num = await gh.createIssue(
        taskTitle,
        taskBody,
        sprint.assignees,
        ["task", `sprint:${sprint.id}`]
      );
      taskIssueNumbers[t.key] = num;
      console.log(`Created task issue #${num} for task ${t.key}`);
    }
  }

  // Create ready-to-start comment idempotently
  const comments = await gh.getComments(sprintIssueNumber);
  const existingRts = findReadyToStartComment(file, sprint.id, comments);
  let readyToStartCommentCreated = false;

  if (!existingRts) {
    const requirements = activationRequirements(file, sprint);
    const commentBody = [
      readyToStartMarker(sprint.id),
      `### Ready to Start Sprint: ${sprint.title} (${sprint.id})`,
      ``,
      `This sprint has been proposed with definition hash: \`${sprint.definition_hash}\`.`,
      ``,
      ...(requirements.length > 0
        ? [`To activate this sprint:`, ...requirements]
        : [`No approval is needed: this sprint is active now and completes automatically when its tasks are done and CI passes.`]),
    ].join("\n");

    await gh.createComment(sprintIssueNumber, commentBody);
    readyToStartCommentCreated = true;
    console.log(`Created ready-to-start comment on sprint issue #${sprintIssueNumber}`);
  } else {
    console.log(`Ready-to-start comment already present on sprint issue #${sprintIssueNumber}`);
  }

  return {
    sprintIssueNumber,
    taskIssueNumbers,
    readyToStartCommentCreated,
  };
}

export async function evaluateActivation(
  file: ValidatedSprintFile,
  sprint: ValidatedSprint,
  gh: GitHubClient
): Promise<ActivationResult> {
  const sprintMarker = sprintIssueMarker(sprint.id);
  const sprintIssue = await gh.findIssueByMarker(sprintMarker);
  if (!sprintIssue) {
    return {
      activated: false,
      currentAgreements: 0,
      requiredAgreements: file.activation_agreements,
      approvers: [],
      reasons: [`Sprint issue for ${sprint.id} not found on GitHub.`],
    };
  }

  const comments = await gh.getComments(sprintIssue.number);
  const rtsComment = findReadyToStartComment(file, sprint.id, comments);

  if (!rtsComment) {
    return {
      activated: false,
      currentAgreements: 0,
      requiredAgreements: file.activation_agreements,
      approvers: [],
      reasons: [`Ready-to-start comment missing on sprint issue #${sprintIssue.number}.`],
    };
  }

  const reactions = await gh.getCommentReactions(rtsComment.id);
  const plusOnes = reactions.filter((r) => r.content === "+1" || r.content === "THUMBS_UP");
  const uniqueUsers = Array.from(new Set(plusOnes.map((r) => r.user.login)));

  const reasons: string[] = [];
  if (uniqueUsers.length < file.activation_agreements) {
    reasons.push(
      `Requires ${file.activation_agreements} approvals, but only has ${uniqueUsers.length} (${uniqueUsers.join(", ") || "none"}).`
    );
  }

  if (sprint.risk_level === 3) {
    const hasOwner = uniqueUsers.some((u) => file.approvers.includes(u));
    if (!hasOwner) {
      reasons.push(`Level 3 sprint requires an owner approval (${file.approvers.join(", ")}), but none reacted.`);
    }
  }

  const activated = reasons.length === 0;
  return {
    activated,
    currentAgreements: uniqueUsers.length,
    requiredAgreements: file.activation_agreements,
    approvers: uniqueUsers,
    reasons,
  };
}

export interface AutoAdvanceResult {
  status: "no_active_sprint" | "awaiting_activation" | "sprint_in_progress" | "sprint_advanced" | "all_sprints_complete";
  activeSprintId?: string;
  completedSprintId?: string;
  nextSprintId?: string;
  blockingReasons?: string[];
}

/** Closes a completed sprint's issue and proposes the next sprint. Returns the next sprint id, if any. */
export async function completeSprint(
  file: ValidatedSprintFile,
  sprint: ValidatedSprint,
  sprintIssue: GitHubIssue,
  gh: GitHubClient
): Promise<string | undefined> {
  if (sprintIssue.state !== "CLOSED") {
    await gh.createComment(
      sprintIssue.number,
      `🎉 **Sprint Completed**: All tasks for **${sprint.id}** (${sprint.title}) are completed and the required CI checks pass on \`${file.default_branch}\`.\n\nClosing this sprint issue and proposing the next sprint in the roadmap.`
    );
    await gh.closeIssue(sprintIssue.number, "completed");
    console.log(`Closed sprint issue #${sprintIssue.number} for ${sprint.id}`);
  }

  const nextSprint = sprint.next ? file.sprints.find((s) => s.id === sprint.next) : undefined;
  if (!nextSprint) return undefined;
  const res = await proposeSprint(file, nextSprint, gh);
  console.log(`Proposed ${nextSprint.id}: sprint issue #${res.sprintIssueNumber}, ${Object.keys(res.taskIssueNumbers).length} task issues.`);
  return nextSprint.id;
}

export async function autoAdvanceSprints(
  file: ValidatedSprintFile,
  gh: GitHubClient
): Promise<AutoAdvanceResult> {
  for (const sprint of file.sprints) {
    const sprintIssue = await gh.findIssueByMarker(sprintIssueMarker(sprint.id));

    // Not proposed yet, or already completed
    if (!sprintIssue || sprintIssue.state === "CLOSED") continue;

    // The open sprint must be activated before it can complete (Level 3 needs the owner's 👍).
    const activation = await evaluateActivation(file, sprint, gh);
    if (!activation.activated) {
      console.log(`Sprint ${sprint.id} is waiting for activation: ${activation.reasons.join(" ")}`);
      return { status: "awaiting_activation", activeSprintId: sprint.id, blockingReasons: activation.reasons };
    }

    const evaluation = await evaluateSprintCompletion(file, sprint, gh);
    if (!evaluation.readyToComplete) {
      console.log(`Sprint ${sprint.id} is still in progress:\n  * ${evaluation.blockingReasons.join("\n  * ")}`);
      return { status: "sprint_in_progress", activeSprintId: sprint.id, blockingReasons: evaluation.blockingReasons };
    }

    const nextSprintId = await completeSprint(file, sprint, sprintIssue, gh);
    return nextSprintId
      ? { status: "sprint_advanced", completedSprintId: sprint.id, nextSprintId }
      : { status: "all_sprints_complete", completedSprintId: sprint.id };
  }

  // If no open sprint was found, check if first sprint needs to be proposed
  const firstSprint = file.sprints[0];
  if (firstSprint) {
    const firstMarker = sprintIssueMarker(firstSprint.id);
    const existing = await gh.findIssueByMarker(firstMarker);
    if (!existing) {
      console.log(`No active sprint found. Auto-proposing first sprint: ${firstSprint.id}...`);
      await proposeSprint(file, firstSprint, gh);
      return {
        status: "sprint_advanced",
        nextSprintId: firstSprint.id,
      };
    }
  }

  return {
    status: "no_active_sprint",
  };
}
