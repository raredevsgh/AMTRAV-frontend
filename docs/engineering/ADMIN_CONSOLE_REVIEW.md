# Admin Console handoff — 3 November 2026

The Admin uses the current AMORTRAV screen layouts with shared typography, controls, tables, dialogs and responsive navigation. The latest cleanup removes demonstration UI while retaining temporary sample records, as explicitly requested. Only the login remains labeled **Demo login**.

## Current behavior

- Normal page headers scroll with the page; they do not cover notices or form content.
- Body text uses a 14px/20px rhythm. Page titles use 34px/40px on desktop, 28px/36px on tablets and 26px/34px on small screens. Record and list titles share this scale; mono identifiers and component-level headings retain their explicit semantic sizes.
- Settings has a responsive policy form, aligned checkbox labels, padded cards, separate success feedback and configured geofence chips. The sample-only reset and nonfunctional stored-theme selector were removed.
- Sidebar preview controls, login personas/state selectors, customer-masking switch, manual journey checkpoint tool and legacy lock/firmware simulation screen are removed. `/operations/demo` receives an early HTTP 307 redirect to `/operations` for existing bookmarks, before the React shell renders.
- Sample provenance is labeled Sample/Reference; no sample signature is presented as cryptographically verified. Manufacturer/account forms retain their actual format and permission checks.

## Backend integration boundary

**This frontend is not connected to a production backend.** Sample records and in-memory writes were deliberately retained at the owner's request. Refresh restores the sample baseline. Hardware commands, telemetry, notifications, replacement fulfillment, authentication and session invalidation are not proven production capabilities.

`admin_panel/features/console-context.tsx` constructs the isolated sample service once. Feature components use `useConsole()` for requests and `useConsoleState()` for shared revision/capability state. Replace the sample adapter and its type with the agreed transport implementation during integration. Reuse the DTOs in `lib/api/types/` and the source-derived validation rules in `lib/api/validation.ts`; do not invent endpoints for design-only operations. Design fixtures must not be combined with live records as a fallback.

Demo login is explicitly opt-in through `AMTRAV_CONSOLE_DEMO=1`; it only grants the local sample session. `VERCEL_ENV=production` disables it. Default-closed verification must explicitly set `AMTRAV_CONSOLE_DEMO=0`, because an owner's ignored `.env.local` may opt into sample access. Replace `lib/console-session.ts` and the login server actions with approved backend session/auth contracts before production integration. Never treat the sample cookie as production authorization.

Claim-code results remain ephemeral. Private-file transport uses the existing filename, MIME, size and owner/admin constraints. Keep the Rust repositories untouched.

## Verification

Run `pnpm lint:admin`, `pnpm --filter admin_panel exec tsc --noEmit --strict`, `pnpm build:admin`, `pnpm test:all`, the two Node adversarial suites, `pnpm sprint:test` and `pnpm sprint validate`. Landing has independent lint/types/build gates and is preserved by this task.

Current browser acceptance is `scripts/admin-release-qa.mjs`, `scripts/admin-screen-qa.mjs` (also `--records`) and `scripts/admin-adversarial-browser-qa.mjs`. The older detailed Figma capture programs and 2 November reports are historical evidence for the previous preview UI; selectors for removed preview controls are not current release gates. Official Chrome and WebKit are exercised through installed Playwright; no production browser dependency is added.

Local logs, original exports, prior failed attempts and current screenshots are preserved under `evidence/admin-release-2026-11-03/` and `evidence/admin-audit-2026-11-02/`. These large local artifacts are not part of the code push. Exact results and remaining Figma access limitations are recorded in the local release report. Exact font-file parity, approved mobile reference parity and exhaustive inaccessible Figma prototype/variant acceptance remain unverified; no pixel-perfect certification is claimed.

## Verified release checkpoint

Build `T-jzn5oiLX-eIM5ZpEZBc` passes Admin lint, strict TypeScript and Webpack production build. Landing lint/types/Webpack also pass with its unrelated source changes preserved. Node checks pass 309 core/legacy scenarios, 31 adversarial scenarios, 15 Sprint tests and six Sprint definitions.

Chrome 156.0.8078.80 and WebKit 26.5 pass 36 workflow groups, six rapid-interaction checks, 4,600 responsive assertions across 16 routes/two roles/nine widths, and 1,656 assertions across all 46 detail records at 320/1440px. This includes shared typography and notice/header separation checks. The 290 axe evaluations report zero violations; incomplete/manual items remain in raw reports, so this is not a comprehensive WCAG certification. Final application hashes show no source changes after these runs.

Failed preliminary runs are retained locally: the initial flow omitted the required alert closure note, and the legacy page-level redirect exposed cancelled WebKit prefetches. The former was corrected in the test; the latter was fixed with the early HTTP redirect and passes the final complete suite without suppressing browser errors.

The original `scripts/console-browser-qa.mjs` command is retained as a compatibility entry point: `--flows-only` forwards to current workflow acceptance; other invocations run current responsive/record acceptance. Raw local evidence is under `evidence/admin-release-2026-11-03/verification-summary.json`; screenshots and the large historical Figma export set stay local rather than being uploaded with application code.
