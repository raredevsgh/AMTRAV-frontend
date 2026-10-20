import assert from "node:assert";
import test from "node:test";
import { validateSprintFile } from "../src/definition.ts";
import { DryRunGitHubClient } from "../src/gh.ts";
import { proposeSprint } from "../src/transition.ts";

test("proposeSprint creates sprint issue and task issues idempotently in dry run", async () => {
  const sprintFile = validateSprintFile({
    schema_version: 1,
    repository: "raredevsgh/AMTRAV-frontend",
    default_branch: "main",
    bot_login: "github-actions[bot]",
    approvers: ["raredevsgh"],
    activation_agreements: 2,
    decision: [],
    sprint: [
      {
        id: "sprint-f0",
        title: "Foundation Sprint",
        order: 0,
        risk_level: 1,
        assignees: ["raredevsgh", "Anapey01"],
        objective: "Test objective",
        task: [
          { key: "F0-1", title: "Task 1", required: true },
          { key: "F0-2", title: "Task 2", required: true },
        ],
      },
    ],
  });

  const gh = new DryRunGitHubClient();
  const res = await proposeSprint(sprintFile, sprintFile.sprints[0], gh);

  assert.strictEqual(res.sprintIssueNumber, 101);
  assert.strictEqual(res.taskIssueNumbers["F0-1"], 102);
  assert.strictEqual(res.taskIssueNumbers["F0-2"], 103);
  assert.strictEqual(res.readyToStartCommentCreated, true);

  // Proposing again reuses existing records
  const res2 = await proposeSprint(sprintFile, sprintFile.sprints[0], gh);
  assert.strictEqual(res2.sprintIssueNumber, 101);
  assert.strictEqual(res2.taskIssueNumbers["F0-1"], 102);
  assert.strictEqual(res2.taskIssueNumbers["F0-2"], 103);
  assert.strictEqual(res2.readyToStartCommentCreated, false);
});
