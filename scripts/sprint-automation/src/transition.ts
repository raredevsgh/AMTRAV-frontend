import type { ValidatedSprint, ValidatedSprintFile } from "./definition.ts";
import type { GitHubClient } from "./gh.ts";
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

export async function proposeSprint(
  file: ValidatedSprintFile,
  sprint: ValidatedSprint,
  gh: GitHubClient
): Promise<ProposeResult> {
  const sprintMarker = sprintIssueMarker(sprint.id);
  let sprintIssue = await gh.findIssueByMarker(sprintMarker);
  let sprintIssueNumber: number;

  if (sprintIssue) {
    sprintIssueNumber = sprintIssue.number;
    console.log(`Found existing sprint issue #${sprintIssueNumber} for ${sprint.id}`);
  } else {
    const title = `${sprint.title} (${sprint.id})`;
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
    sprintIssueNumber = await gh.createIssue(
      title,
      bodyLines.join("\n"),
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
    if (existingTask) {
      taskIssueNumbers[t.key] = existingTask.number;
      console.log(`Found existing task issue #${existingTask.number} for task ${t.key}`);
    } else {
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
  const rtsMarker = readyToStartMarker(sprint.id);
  const comments = await gh.getComments(sprintIssueNumber);
  const existingRts = comments.find((c) => c.body.includes(rtsMarker));
  let readyToStartCommentCreated = false;

  if (!existingRts) {
    const commentBody = [
      rtsMarker,
      `### Ready to Start Sprint: ${sprint.title} (${sprint.id})`,
      ``,
      `This sprint has been proposed with definition hash: \`${sprint.definition_hash}\`.`,
      ``,
      `To activate this sprint:`,
      `- **${file.activation_agreements} collaborator +1 (👍) reactions** are required on this comment.`,
      sprint.risk_level === 3 ? `- Because this is a **Risk Level 3** sprint, owner approval from \`${file.approvers.join(", ")}\` is also required.` : ``,
    ].filter(Boolean).join("\n");

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

  const rtsMarker = readyToStartMarker(sprint.id);
  const comments = await gh.getComments(sprintIssue.number);
  const rtsComment = comments.find((c) => c.body.includes(rtsMarker));

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
