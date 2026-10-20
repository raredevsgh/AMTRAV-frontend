import assert from "node:assert";
import test from "node:test";
import { computeDefinitionHash } from "../src/hash.ts";
import type { RawSprint, RawTomlFile } from "../src/toml.ts";

test("computeDefinitionHash is deterministic", () => {
  const file: RawTomlFile = {
    schema_version: 1,
    repository: "raredevsgh/AMTRAV-frontend",
    default_branch: "main",
    bot_login: "bot",
    approvers: ["raredevsgh", "Anapey01"],
    activation_agreements: 2,
  };

  const sprint: RawSprint = {
    id: "sprint-f0",
    title: "Sprint 0",
    order: 0,
    risk_level: 1,
    assignees: ["raredevsgh"],
    objective: "Obj",
    acceptance_criteria: ["Criteria 1", "Criteria 2"],
    task: [{ key: "F0-1", title: "Task 1", required: true }],
  };

  const hash1 = computeDefinitionHash(file, sprint);
  const hash2 = computeDefinitionHash(file, sprint);
  assert.strictEqual(hash1, hash2);
  assert.ok(hash1.startsWith("sha256:"));
});

test("computeDefinitionHash changes when acceptance criteria change", () => {
  const file: RawTomlFile = {
    schema_version: 1,
    repository: "raredevsgh/AMTRAV-frontend",
    default_branch: "main",
    bot_login: "bot",
    approvers: ["raredevsgh"],
    activation_agreements: 2,
  };

  const sprintA: RawSprint = {
    id: "sprint-f0",
    title: "Sprint 0",
    order: 0,
    risk_level: 1,
    assignees: ["raredevsgh"],
    objective: "Obj",
    acceptance_criteria: ["Criteria 1"],
    task: [{ key: "F0-1", title: "Task 1", required: true }],
  };

  const sprintB: RawSprint = {
    ...sprintA,
    acceptance_criteria: ["Criteria 1 (modified)"],
  };

  const hashA = computeDefinitionHash(file, sprintA);
  const hashB = computeDefinitionHash(file, sprintB);
  assert.notStrictEqual(hashA, hashB);
});

test("computeDefinitionHash ignores narrative-only fields like objective or title", () => {
  const file: RawTomlFile = {
    schema_version: 1,
    repository: "raredevsgh/AMTRAV-frontend",
    default_branch: "main",
    bot_login: "bot",
    approvers: ["raredevsgh"],
    activation_agreements: 2,
  };

  const sprintA: RawSprint = {
    id: "sprint-f0",
    title: "Original Title",
    order: 0,
    risk_level: 1,
    assignees: ["raredevsgh"],
    objective: "Original Objective",
    task: [{ key: "F0-1", title: "Task 1", required: true }],
  };

  const sprintB: RawSprint = {
    ...sprintA,
    title: "Changed Title",
    objective: "Changed Objective",
  };

  const hashA = computeDefinitionHash(file, sprintA);
  const hashB = computeDefinitionHash(file, sprintB);
  assert.strictEqual(hashA, hashB);
});
