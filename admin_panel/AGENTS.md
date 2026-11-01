<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Console boundaries

- Read [the implementation review](../docs/engineering/ADMIN_CONSOLE_REVIEW.md) before extending console behavior. Current MVP is Devices, Register, Details, Accounts and Files; archived maps/alerts/OTA are not production capabilities.
- Reuse `components/app-shell.tsx`, `section-page.tsx`, `console-ui.tsx` and `lib/admin-sections.ts`. Keep one main/h1, native modal focus/scroll behavior, and the explicit wire-role mapping.
- `lib/api/types.ts` is the transport contract. Source-derived validators live in `lib/api/validation.ts`; fixture composition and mock mutations stay separate from future HTTP transport. Lists have no total count or server search.
- The opt-in preview cookie selects fictional data only. Never turn it into production authorization. Real session/proxy work needs the F1 decisions; default access must stay closed.
- Keep claim-code results in ephemeral component state; clear on navigation. Never persist/log codes, passwords, tokens or job receipts. Manufacturer reads and writes are scoped, independently of navigation visibility.
- Private files use owner/admin access, raw bytes and the handler MIME/filename/size constraints. No invented file-to-device association, telemetry, notification or OTA behavior.
- Run both app lint/type/build gates, `pnpm test:admin`, Sprint checks and relevant browser acceptance. The review documents commands and screenshot comparison limits; never claim exact Figma parity without source geometry.
