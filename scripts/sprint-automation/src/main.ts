import { resolve } from "node:path";
import { loadAndValidateSprints } from "./definition.ts";
import { evaluateSprintCompletion } from "./evaluate.ts";
import { DryRunGitHubClient, GhCliClient, type GitHubClient } from "./gh.ts";
import { syncRoadmap } from "./sync.ts";
import { evaluateActivation, proposeSprint } from "./transition.ts";

function parseArgs(args: string[]) {
  const command = args[0] || "help";
  let sprintId: string | null = null;
  let dryRun = false;

  for (let i = 1; i < args.length; i++) {
    if (args[i] === "--sprint" && args[i + 1]) {
      sprintId = args[i + 1];
      i++;
    } else if (args[i] === "--dry-run") {
      dryRun = true;
    }
  }

  return { command, sprintId, dryRun };
}

async function main() {
  const rootDir = resolve(process.cwd());
  const sprintsTomlPath = resolve(rootDir, "docs/planning/sprints.toml");
  const roadmapPath = resolve(rootDir, "docs/planning/FRONTEND_SPRINT_ROADMAP.md");

  const { command, sprintId, dryRun } = parseArgs(process.argv.slice(2));

  console.log(`Loading sprint definitions from: ${sprintsTomlPath}`);
  const sprintFile = loadAndValidateSprints(sprintsTomlPath);
  console.log(`Validated ${sprintFile.sprints.length} sprints. Repository: ${sprintFile.repository}`);

  const gh: GitHubClient = dryRun ? new DryRunGitHubClient() : new GhCliClient(sprintFile.repository);

  if (command === "validate") {
    console.log("Validation succeeded! Sprints and decisions are well-formed.");
    for (const s of sprintFile.sprints) {
      console.log(`- [${s.id}] ${s.title} (Order: ${s.order}, Risk: ${s.risk_level}, Hash: ${s.definition_hash.slice(0, 15)}...)`);
    }
    return;
  }

  if (command === "propose") {
    if (!sprintId) {
      console.error("Error: --sprint <id> is required for propose.");
      process.exit(1);
    }
    const sprint = sprintFile.sprints.find((s) => s.id === sprintId);
    if (!sprint) {
      console.error(`Error: Sprint ${sprintId} not found in sprints.toml.`);
      process.exit(1);
    }
    console.log(`Proposing ${sprint.id} (dryRun: ${dryRun})...`);
    const res = await proposeSprint(sprintFile, sprint, gh);
    console.log(`Proposed sprint ${sprint.id}: Issue #${res.sprintIssueNumber}, Tasks: ${Object.keys(res.taskIssueNumbers).length}`);
    return;
  }

  if (command === "activation") {
    if (!sprintId) {
      console.error("Error: --sprint <id> is required for activation.");
      process.exit(1);
    }
    const sprint = sprintFile.sprints.find((s) => s.id === sprintId);
    if (!sprint) {
      console.error(`Error: Sprint ${sprintId} not found in sprints.toml.`);
      process.exit(1);
    }
    const act = await evaluateActivation(sprintFile, sprint, gh);
    console.log(`Activation status for ${sprint.id}:`);
    console.log(`- Activated: ${act.activated ? "YES" : "NO"}`);
    console.log(`- Agreements: ${act.currentAgreements} / ${act.requiredAgreements}`);
    console.log(`- Approvers: ${act.approvers.join(", ") || "none"}`);
    if (act.reasons.length > 0) {
      console.log(`- Blockers:`);
      for (const r of act.reasons) console.log(`  * ${r}`);
    }
    return;
  }

  if (command === "evaluate") {
    if (!sprintId) {
      console.error("Error: --sprint <id> is required for evaluate.");
      process.exit(1);
    }
    const sprint = sprintFile.sprints.find((s) => s.id === sprintId);
    if (!sprint) {
      console.error(`Error: Sprint ${sprintId} not found in sprints.toml.`);
      process.exit(1);
    }
    const evalRes = await evaluateSprintCompletion(sprintFile, sprint, gh);
    console.log(`Completion evaluation for ${sprint.id}:`);
    console.log(`- Ready to Complete: ${evalRes.readyToComplete ? "YES" : "NO"}`);
    console.log(`- Tasks Completed: ${evalRes.tasksCompleted ? "YES" : "NO"}`);
    console.log(`- PRs Merged: ${evalRes.prsMerged ? "YES" : "NO"}`);
    console.log(`- Checks Passed: ${evalRes.checksPassed ? "YES" : "NO"}`);
    console.log(`- Approval Present: ${evalRes.approvalPresent ? "YES" : "NO"}`);
    if (evalRes.blockingReasons.length > 0) {
      console.log(`- Blockers:`);
      for (const b of evalRes.blockingReasons) console.log(`  * ${b}`);
    }
    return;
  }

  if (command === "advance") {
    if (!sprintId) {
      console.error("Error: --sprint <id> is required for advance.");
      process.exit(1);
    }
    const sprint = sprintFile.sprints.find((s) => s.id === sprintId);
    if (!sprint) {
      console.error(`Error: Sprint ${sprintId} not found in sprints.toml.`);
      process.exit(1);
    }
    const evalRes = await evaluateSprintCompletion(sprintFile, sprint, gh);
    if (!evalRes.readyToComplete) {
      console.error(`Cannot advance ${sprint.id}; completion conditions not satisfied.`);
      process.exit(1);
    }
    console.log(`Advancing ${sprint.id}...`);
    // Close sprint issue and propose next
    if (sprint.next) {
      const nextSprint = sprintFile.sprints.find((s) => s.id === sprint.next);
      if (nextSprint) {
        await proposeSprint(sprintFile, nextSprint, gh);
        console.log(`Advanced to next sprint: ${nextSprint.id}`);
      }
    } else {
      console.log(`Sprint ${sprint.id} is the final sprint in roadmap!`);
    }
    return;
  }

  if (command === "sync-roadmap") {
    console.log(`Syncing roadmap status...`);
    await syncRoadmap(sprintFile, roadmapPath, gh);
    return;
  }

  console.log(`AMTRAV Frontend Sprint Automation CLI

Usage:
  pnpm sprint validate
  pnpm sprint propose --sprint <sprint-id> [--dry-run]
  pnpm sprint activation --sprint <sprint-id> [--dry-run]
  pnpm sprint evaluate --sprint <sprint-id> [--dry-run]
  pnpm sprint advance --sprint <sprint-id> [--dry-run]
  pnpm sprint sync-roadmap [--dry-run]
`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
