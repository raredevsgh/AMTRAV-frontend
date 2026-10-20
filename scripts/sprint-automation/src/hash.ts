import { createHash } from "node:crypto";
import type { RawSprint, RawTomlFile } from "./toml.ts";

/**
 * Computes canonical SHA-256 hash that approvals are bound to.
 * Changing acceptance criteria, required tasks, PRs, or approvers produces a new hash,
 * invalidating previous sign-offs.
 */
export function computeDefinitionHash(file: RawTomlFile, sprint: RawSprint): string {
  const approvers = [...file.approvers].sort();
  const requiredPrs = [...(sprint.required_prs || [])].sort((a, b) => a - b);
  const requiredChecks = [...(sprint.required_checks || [])].sort();

  const requiredTasks = (sprint.task || [])
    .filter((t) => t.required !== false)
    .map((t) => ({
      key: t.key,
      title: t.title,
      issue: t.issue ?? null,
    }));

  const input = {
    schema_version: file.schema_version,
    repository: file.repository,
    sprint_id: sprint.id,
    approvers,
    acceptance_criteria: sprint.acceptance_criteria || [],
    required_tasks: requiredTasks,
    required_prs: requiredPrs,
    checks_required: Boolean(sprint.checks_required),
    required_checks: requiredChecks,
  };

  const canonical = JSON.stringify(input);
  const digest = createHash("sha256").update(canonical).digest("hex");
  return `sha256:${digest}`;
}
