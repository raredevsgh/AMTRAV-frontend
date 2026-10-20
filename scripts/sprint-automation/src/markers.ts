/**
 * Hidden HTML-comment markers that identify automation-owned GitHub records.
 * Markers are matched exactly in issues and comments.
 */

export function sprintIssueMarker(sprintId: string): string {
  return `<!-- sprint-automation:${sprintId} -->`;
}

export function taskIssueMarker(taskKey: string): string {
  return `<!-- sprint-automation:task:${taskKey} -->`;
}

export function readyToStartMarker(sprintId: string): string {
  return `<!-- sprint-automation:ready-to-start:${sprintId} -->`;
}

export function readyToCompleteMarker(sprintId: string, definitionHash: string): string {
  return `<!-- sprint-automation:ready-to-complete:${sprintId}:${definitionHash} -->`;
}

export function readyToCompletePrefix(sprintId: string): string {
  return `<!-- sprint-automation:ready-to-complete:${sprintId}:`;
}
