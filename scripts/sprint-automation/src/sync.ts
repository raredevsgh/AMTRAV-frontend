import { readFileSync, writeFileSync } from "node:fs";
import type { ValidatedSprintFile } from "./definition.ts";
import type { GitHubClient } from "./gh.ts";
import { sprintIssueMarker } from "./markers.ts";
import { evaluateActivation } from "./transition.ts";

export async function syncRoadmap(
  file: ValidatedSprintFile,
  roadmapPath: string,
  gh: GitHubClient
): Promise<void> {
  const content = readFileSync(roadmapPath, "utf-8");
  let updatedContent = content;

  for (const sprint of file.sprints) {
    const marker = sprintIssueMarker(sprint.id);
    const issue = await gh.findIssueByMarker(marker);

    let status = "Unstarted";
    if (issue) {
      if (issue.state === "CLOSED") {
        status = "Done";
      } else {
        const activation = await evaluateActivation(file, sprint, gh);
        status = activation.activated ? "Active" : "Proposed";
      }
    }

    // Replace status in markdown table
    // Regex matches e.g. | **Sprint F0** | ... | Level 1 | **Unstarted** |
    const rowRegex = new RegExp(
      `(\\|\\s*\\*\\*Sprint ${sprint.id.replace("sprint-", "").toUpperCase()}\\*\\*\\s*\\|[^|]+\\|[^|]+\\|\\s*\\*\\*)([^*]+)(\\*\\*)`,
      "g"
    );
    updatedContent = updatedContent.replace(rowRegex, `$1${status}$3`);
  }

  if (updatedContent !== content) {
    writeFileSync(roadmapPath, updatedContent, "utf-8");
    console.log(`Updated sprint statuses in ${roadmapPath}`);
  } else {
    console.log(`Roadmap ${roadmapPath} already in sync.`);
  }
}
