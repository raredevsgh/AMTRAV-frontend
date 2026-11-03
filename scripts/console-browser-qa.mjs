// Preserve the original QA entry point while targeting the current Admin UI.
// Removed preview controls remain documented in local historical audit evidence.
if (process.argv.includes("--flows-only")) {
  await import("./admin-release-qa.mjs");
} else {
  await import("./admin-screen-qa.mjs");
}
