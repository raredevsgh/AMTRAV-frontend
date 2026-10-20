import type { ValidatedSprint, ValidatedSprintFile } from "./definition.ts";
import type { GitHubClient } from "./gh.ts";
import { readyToCompleteMarker, readyToCompletePrefix, sprintIssueMarker, taskIssueMarker } from "./markers.ts";

export interface EvaluationResult {
  readyToComplete: boolean;
  tasksCompleted: boolean;
  prsMerged: boolean;
  checksPassed: boolean;
  approvalPresent: boolean;
  blockingReasons: string[];
}

export async function evaluateSprintCompletion(
  file: ValidatedSprintFile,
  sprint: ValidatedSprint,
  gh: GitHubClient
): Promise<EvaluationResult> {
  const blockingReasons: string[] = [];

  const sprintMarker = sprintIssueMarker(sprint.id);
  const sprintIssue = await gh.findIssueByMarker(sprintMarker);
  if (!sprintIssue) {
    return {
      readyToComplete: false,
      tasksCompleted: false,
      prsMerged: false,
      checksPassed: false,
      approvalPresent: false,
      blockingReasons: [`Sprint issue for ${sprint.id} not found on GitHub.`],
    };
  }

  // 1. Evaluate Tasks
  let tasksCompleted = true;
  for (const t of sprint.task || []) {
    if (t.required === false) continue;
    const tMarker = taskIssueMarker(t.key);
    const taskIssue = await gh.findIssueByMarker(tMarker);
    if (!taskIssue) {
      tasksCompleted = false;
      blockingReasons.push(`Task issue for ${t.key} not found.`);
    } else if (taskIssue.state !== "CLOSED" || (taskIssue.stateReason && taskIssue.stateReason !== "COMPLETED")) {
      tasksCompleted = false;
      blockingReasons.push(`Task issue #${taskIssue.number} (${t.key}) is ${taskIssue.state} (reason: ${taskIssue.stateReason || "none"}).`);
    }
  }

  // 2. Evaluate Required PRs
  let prsMerged = true;
  for (const pr of sprint.required_prs || []) {
    const merged = await gh.isPrMerged(pr);
    if (!merged) {
      prsMerged = false;
      blockingReasons.push(`Required PR #${pr} is not merged.`);
    }
  }

  // 3. Evaluate Required CI Checks
  let checksPassed = true;
  if (sprint.checks_required) {
    const checks = await gh.getCheckRuns("HEAD");
    for (const reqCheck of sprint.required_checks || []) {
      const status = checks[reqCheck];
      if (status !== "success") {
        checksPassed = false;
        blockingReasons.push(`Required CI check "${reqCheck}" is "${status || "missing"}".`);
      }
    }
  }

  // 4. Evaluate Ready-to-Complete Comment & Sign-off
  let approvalPresent = false;
  const expectedMarker = readyToCompleteMarker(sprint.id, sprint.definition_hash);
  const prefix = readyToCompletePrefix(sprint.id);
  const comments = await gh.getComments(sprintIssue.number);
  const rtcComment = comments.find((c) => c.body.includes(expectedMarker));

  if (!rtcComment) {
    // Check if there is an outdated comment with old hash
    const staleComment = comments.find((c) => c.body.includes(prefix));
    if (staleComment) {
      blockingReasons.push(
        `Ready-to-complete comment has outdated hash. Sprint definition has changed since approval was requested.`
      );
    } else {
      blockingReasons.push(`Ready-to-complete comment not found for hash ${sprint.definition_hash}.`);
    }
  } else {
    const reactions = await gh.getCommentReactions(rtcComment.id);
    const plusOnes = reactions.filter((r) => r.content === "+1" || r.content === "THUMBS_UP");
    const hasOwnerApproval = plusOnes.some((r) => file.approvers.includes(r.user.login));
    if (hasOwnerApproval) {
      approvalPresent = true;
    } else {
      blockingReasons.push(`Ready-to-complete comment missing approval from ${file.approvers.join(", ")}.`);
    }
  }

  const readyToComplete = blockingReasons.length === 0;
  return {
    readyToComplete,
    tasksCompleted,
    prsMerged,
    checksPassed,
    approvalPresent,
    blockingReasons,
  };
}
