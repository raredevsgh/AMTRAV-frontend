import assert from "node:assert";
import test from "node:test";
import { validateSprintFile } from "../src/definition.ts";
import type { RawTomlFile } from "../src/toml.ts";

function createValidRaw(): RawTomlFile {
  return {
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
        title: "Sprint 0",
        order: 0,
        next: "sprint-f1",
        risk_level: 1,
        assignees: ["raredevsgh"],
        objective: "Test objective",
        task: [{ key: "T0-1", title: "Task 1", required: true }],
      },
      {
        id: "sprint-f1",
        title: "Sprint 1",
        order: 1,
        next: "",
        risk_level: 2,
        assignees: ["raredevsgh"],
        objective: "Test objective 2",
        task: [{ key: "T1-1", title: "Task 2", required: true }],
      },
    ],
  };
}

test("validateSprintFile accepts well-formed definition", () => {
  const raw = createValidRaw();
  const validated = validateSprintFile(raw);
  assert.strictEqual(validated.sprints.length, 2);
  assert.ok(validated.sprints[0].definition_hash.startsWith("sha256:"));
});

test("validateSprintFile rejects invalid schema version", () => {
  const raw = createValidRaw();
  raw.schema_version = 2;
  assert.throws(() => validateSprintFile(raw), /Unsupported schema_version/);
});

test("validateSprintFile rejects empty approvers", () => {
  const raw = createValidRaw();
  raw.approvers = [];
  assert.throws(() => validateSprintFile(raw), /approvers list cannot be empty/);
});

test("validateSprintFile rejects duplicate sprint ids", () => {
  const raw = createValidRaw();
  raw.sprint![1].id = "sprint-f0";
  assert.throws(() => validateSprintFile(raw), /Duplicate sprint id/);
});

test("validateSprintFile rejects duplicate task keys across sprints", () => {
  const raw = createValidRaw();
  raw.sprint![1].task![0].key = "T0-1";
  assert.throws(() => validateSprintFile(raw), /Duplicate task key/);
});

test("validateSprintFile rejects non-sequential order", () => {
  const raw = createValidRaw();
  raw.sprint![1].order = 5;
  assert.throws(() => validateSprintFile(raw), /has order 5, expected 1/);
});

test("validateSprintFile rejects mismatched next pointer", () => {
  const raw = createValidRaw();
  raw.sprint![0].next = "sprint-wrong";
  assert.throws(() => validateSprintFile(raw), /next="sprint-wrong", but next in order is "sprint-f1"/);
});
