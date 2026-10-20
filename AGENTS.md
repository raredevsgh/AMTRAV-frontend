<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Codebase discipline

Applies to every change, by any agent or contributor.

- Inspect and reuse existing functionality before adding new code.
- Keep changes scoped to the requested task.
- Require a concrete reason for new files, dependencies, abstractions, and configuration.
- Prefer the simplest maintainable solution; avoid speculative generalization.
- Preserve correctness, security, and meaningful tests.
- Review the final diff and run relevant checks before declaring work complete.
