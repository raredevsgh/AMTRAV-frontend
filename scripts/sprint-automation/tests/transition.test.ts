import assert from "node:assert";
import test from "node:test";
import { validateSprintFile } from "../src/definition.ts";
import { DryRunGitHubClient } from "../src/gh.ts";
import { autoAdvanceSprints, proposeSprint } from "../src/transition.ts";

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

test("autoAdvanceSprints reports sprint in progress when tasks are open", async () => {
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
        assignees: ["raredevsgh"],
        objective: "Test objective",
        next: "sprint-f1",
        task: [
          { key: "F0-1", title: "Task 1", required: true },
          { key: "F0-2", title: "Task 2", required: true },
        ],
      },
      {
        id: "sprint-f1",
        title: "Next Sprint",
        order: 1,
        risk_level: 1,
        assignees: ["raredevsgh"],
        objective: "Next objective",
        task: [{ key: "F1-1", title: "Task 3", required: true }],
      },
    ],
  });

  const gh = new DryRunGitHubClient();
  await proposeSprint(sprintFile, sprintFile.sprints[0], gh);

  // Both tasks open
  const res = await autoAdvanceSprints(sprintFile, gh);
  assert.strictEqual(res.status, "sprint_in_progress");
  assert.strictEqual(res.activeSprintId, "sprint-f0");
  assert.deepStrictEqual(res.openTasks, ["F0-1", "F0-2"]);
});

test("autoAdvanceSprints automatically closes completed sprint and proposes next sprint", async () => {
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
        assignees: ["raredevsgh"],
        objective: "Test objective",
        next: "sprint-f1",
        task: [
          { key: "F0-1", title: "Task 1", required: true },
          { key: "F0-2", title: "Task 2", required: true },
        ],
      },
      {
        id: "sprint-f1",
        title: "Next Sprint",
        order: 1,
        risk_level: 1,
        assignees: ["raredevsgh"],
        objective: "Next objective",
        task: [{ key: "F1-1", title: "Task 3", required: true }],
      },
    ],
  });

  const gh = new DryRunGitHubClient();
  const proposed = await proposeSprint(sprintFile, sprintFile.sprints[0], gh);

  // Close both tasks
  await gh.closeIssue(proposed.taskIssueNumbers["F0-1"]);
  await gh.closeIssue(proposed.taskIssueNumbers["F0-2"]);

  // Run auto-advance
  const res = await autoAdvanceSprints(sprintFile, gh);
  assert.strictEqual(res.status, "sprint_advanced");
  assert.strictEqual(res.completedSprintId, "sprint-f0");
  assert.strictEqual(res.nextSprintId, "sprint-f1");

  // Verify sprint-f0 issue is closed
  const sprint0Issue = await gh.findIssueByMarker("<!-- sprint-automation:sprint-f0 -->");
  assert.strictEqual(sprint0Issue?.state, "CLOSED");

  // Verify sprint-f1 issue is created and OPEN
  const sprint1Issue = await gh.findIssueByMarker("<!-- sprint-automation:sprint-f1 -->");
  assert.strictEqual(sprint1Issue?.state, "OPEN");

  // Verify task F1-1 issue is created
  const taskF1Issue = await gh.findIssueByMarker("<!-- sprint-automation:task:F1-1 -->");
  assert.ok(taskF1Issue);
  assert.strictEqual(taskF1Issue?.state, "OPEN");
});
