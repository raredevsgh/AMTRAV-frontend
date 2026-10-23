import type { ValidatedSprint, ValidatedSprintFile } from "./definition.ts";
import type { GitHubClient } from "./gh.ts";
import { sprintIssueMarker, taskIssueMarker } from "./markers.ts";

export interface EvaluationResult {
  readyToComplete: boolean;
  tasksCompleted: boolean;
  prsMerged: boolean;
  checksPassed: boolean;
  blockingReasons: string[];
}

// A sprint is complete when every required task issue is closed as completed, every
// required PR is merged and every required CI check passed on the default branch.
export async function evaluateSprintCompletion(
  file: ValidatedSprintFile,
  sprint: ValidatedSprint,
  gh: GitHubClient
): Promise<EvaluationResult> {
  const blockingReasons: string[] = [];

  const sprintIssue = await gh.findIssueByMarker(sprintIssueMarker(sprint.id));
  if (!sprintIssue) {
    return {
      readyToComplete: false,
      tasksCompleted: false,
      prsMerged: false,
      checksPassed: false,
      blockingReasons: [`Sprint issue for ${sprint.id} not found on GitHub.`],
    };
  }

  // 1. Required tasks: closed as completed ("not planned" does not count)
  let tasksCompleted = true;
  for (const t of sprint.task || []) {
    if (t.required === false) continue;
    const taskIssue = await gh.findIssueByMarker(taskIssueMarker(t.key));
    if (!taskIssue) {
      tasksCompleted = false;
      blockingReasons.push(`Task issue for ${t.key} not found.`);
    } else if (taskIssue.state !== "CLOSED" || taskIssue.stateReason !== "COMPLETED") {
      tasksCompleted = false;
      blockingReasons.push(`Task issue #${taskIssue.number} (${t.key}) is ${taskIssue.state} (reason: ${taskIssue.stateReason || "none"}).`);
    }
  }

  // 2. Required PRs
  let prsMerged = true;
  for (const pr of sprint.required_prs || []) {
    if (!(await gh.isPrMerged(pr))) {
      prsMerged = false;
      blockingReasons.push(`Required PR #${pr} is not merged.`);
    }
  }

  // 3. Required CI checks on the default branch
  let checksPassed = true;
  if (sprint.checks_required) {
    const checks = await gh.getCheckRuns(file.default_branch);
    for (const reqCheck of sprint.required_checks || []) {
      const status = checks[reqCheck];
      if (status !== "success") {
        checksPassed = false;
        blockingReasons.push(`Required CI check "${reqCheck}" is "${status || "missing"}" on ${file.default_branch}.`);
      }
    }
  }

  return {
    readyToComplete: blockingReasons.length === 0,
    tasksCompleted,
    prsMerged,
    checksPassed,
    blockingReasons,
  };
}
