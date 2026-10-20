import { readFileSync } from "node:fs";
import { computeDefinitionHash } from "./hash.ts";
import { parseSprintsToml, type RawDecision, type RawSprint, type RawTask, type RawTomlFile } from "./toml.ts";

export interface ValidatedSprintFile {
  schema_version: number;
  repository: string;
  default_branch: string;
  bot_login: string;
  approvers: string[];
  activation_agreements: number;
  decisions: RawDecision[];
  sprints: ValidatedSprint[];
}

export interface ValidatedSprint extends RawSprint {
  definition_hash: string;
}

export function loadAndValidateSprints(filePath: string): ValidatedSprintFile {
  const content = readFileSync(filePath, "utf-8");
  return validateSprintFile(parseSprintsToml(content));
}

export function validateSprintFile(raw: RawTomlFile): ValidatedSprintFile {
  if (raw.schema_version !== 1) {
    throw new Error(`Unsupported schema_version: ${raw.schema_version}. Expected 1.`);
  }

  if (!raw.repository || !raw.repository.includes("/")) {
    throw new Error(`Invalid repository: "${raw.repository}". Expected format "owner/repo".`);
  }

  if (!raw.approvers || raw.approvers.length === 0) {
    throw new Error("approvers list cannot be empty.");
  }

  if (raw.activation_agreements < 1) {
    throw new Error("activation_agreements must be at least 1.");
  }

  const sprints = raw.sprint || [];
  if (sprints.length === 0) {
    throw new Error("sprints.toml must define at least one sprint.");
  }

  const seenSprintIds = new Set<string>();
  const seenTaskKeys = new Set<string>();

  const validatedSprints: ValidatedSprint[] = [];

  for (let i = 0; i < sprints.length; i++) {
    const s = sprints[i];

    if (!s.id) {
      throw new Error(`Sprint at index ${i} has empty id.`);
    }

    if (seenSprintIds.has(s.id)) {
      throw new Error(`Duplicate sprint id: "${s.id}".`);
    }
    seenSprintIds.add(s.id);

    if (s.order !== i) {
      throw new Error(`Sprint "${s.id}" has order ${s.order}, expected ${i}.`);
    }

    if (s.risk_level < 0 || s.risk_level > 3) {
      throw new Error(`Sprint "${s.id}" has invalid risk_level ${s.risk_level}. Must be 0..3.`);
    }

    if (!s.assignees || s.assignees.length === 0) {
      throw new Error(`Sprint "${s.id}" must have at least one assignee.`);
    }

    const tasks = s.task || [];
    for (const t of tasks) {
      if (!t.key) {
        throw new Error(`Sprint "${s.id}" contains a task with empty key.`);
      }
      if (seenTaskKeys.has(t.key)) {
        throw new Error(`Duplicate task key: "${t.key}".`);
      }
      seenTaskKeys.add(t.key);
    }

    const hash = computeDefinitionHash(raw, s);
    validatedSprints.push({
      ...s,
      definition_hash: hash,
    });
  }

  // Validate next pointers
  for (let i = 0; i < validatedSprints.length; i++) {
    const s = validatedSprints[i];
    if (i < validatedSprints.length - 1) {
      const expectedNext = validatedSprints[i + 1].id;
      if (s.next && s.next !== expectedNext) {
        throw new Error(`Sprint "${s.id}" has next="${s.next}", but next in order is "${expectedNext}".`);
      }
    } else {
      if (s.next && s.next.trim() !== "") {
        throw new Error(`Last sprint "${s.id}" must have empty next pointer, got "${s.next}".`);
      }
    }
  }

  return {
    schema_version: raw.schema_version,
    repository: raw.repository,
    default_branch: raw.default_branch || "main",
    bot_login: raw.bot_login || "github-actions[bot]",
    approvers: raw.approvers,
    activation_agreements: raw.activation_agreements,
    decisions: raw.decision || [],
    sprints: validatedSprints,
  };
}
