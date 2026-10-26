# Admin Console implementation review

26 October 2026. Branch `feat/admin-console-mvp`, stacked on PR #50 (`21b2133`). Both marketing PRs and all source worktrees stay untouched. Both Rust checkouts are read-only.

## Reference and scope inventory — before implementation

Figma session `426f3f06-4b3d-48a3-8283-f2bf3b3e5a01`: design context, metadata and screenshot for `2217:5954` return the seat call limit. Current layer hierarchy, variables and geometry are therefore not independently verified. The owner identifies `2217:5954` as “AMORTRAV MVP — 02 States, journey & implementation handoff” and distinguishes “ARCHIVE — Original references & superseded journey”. Other supplied nodes: `2217:2722`, `2217:3224`, `2217:2224`, `2217:5249`. Do not assign unverified node-to-screen mappings. Supplied latest MVP overview and state sheets support the core registry implementation; older expanded dashboards are not treated as approved live modules.

| Screen / feature | Existing state | Evidence / scope | Decision / verification target |
| --- | --- | --- | --- |
| Shared shell | Responsive F0 client shell, fixed fake administrator identity | Current MVP sidebar: Devices / Register device / Accounts / Files; manufacturer omits Accounts | Refine existing shell, reuse role/config/icons; native modal drawer; server demo gate; one main |
| Sign-in | Disabled skeleton | Latest split-layout reference + Access states | Implement validation/pending/401/429/503/recovery; production fails closed; explicit opt-in fictional demo only |
| Devices | Three read-only DTO cards | Current MVP table; declared firmware and no invented totals | Reuse typed API; semantic searchable/filterable current-page table, limit/offset, loading/empty/error |
| Registration + success | Missing | Current MVP form/handoff + state sheets | Source-backed validation, role-scoped manufacturer, duplicate handling, ephemeral example-code reveal/copy/dismiss |
| Device details | Async params/Suspense skeleton | Current MVP metadata/audit/lifecycle cards | Preserve route/params/sanitization; typed data, edit/cancel, audit pagination, rotate/revoke confirmations |
| Accounts | Read-only mock list | Current MVP Accounts; not old Manufacturers inventory chart | Administrator-only page and mock service; role confirmation, self/mobile restrictions, async manufacturer job states |
| Files | Read-only mock list | Current MVP raw-byte private upload; source MIME allowlist, 1 byte–10 MiB | Validation, selection/drop, upload/retry, scoped list/download of harmless fixtures; no fake backend files |
| Access/shared states | Mostly missing | `2217:5954` handoff / supplied state sheets | Reusable status/error/loading/dialog/field/table primitives; states tested through real screens, no public gallery |
| Manufacturer | Navigation filtering only | Current MVP scoped workspace | Identity-specific service, registration ownership, no admin lookup, direct restricted-route denial |
| Registry metrics/chart/calendar | Expanded reference only | No approved analytics contract or verified current hierarchy | Defer; do not fabricate weekly trends/live dashboard |
| Map / notifications / OTA | Unsupported | Roadmap explicitly excludes; earlier modular backend returns 501 | Defer outside production navigation; no fake coordinates/alert count/rollout |
| Password change / complaint resolution | Design opportunities | No confirmed API for these flows | Informational administrator-assisted guidance; document dependency |

## Contract evidence

Target source: `back/AMTRAV/src/devices/models.rs`, `handlers.rs`, `src/admin.rs`, `src/files/mod.rs`, `src/auth/validation.rs`, `src/auth/jobs/mod.rs`. Contracts are source-derived, **not verified against a running OpenAPI server or live backend**. The separate modular rewrite has 501 stubs and is not combined with this API.

- Serial: trim + ASCII uppercase, 6–64 ASCII letters/digits/hyphens/underscores. Model/firmware: nonempty trimmed text, no controls, at most 128/64 UTF-8 bytes.
- Administrator supplies a manufacturer-role account UUID; manufacturer defaults to their own identity and cannot impersonate another.
- Claim codes are one-time ownership proof, not hardware authentication; rotation only while registered/unowned; revoke disables claiming/registry edits, not physical lock/wipe.
- Lists use limit/offset without total counts or search endpoint. UI filtering is explicitly current-page filtering.
- Accounts: no self-role change; Google/mobile identities remain users; password identities may be manufacturer/admin. Live role changes invalidate tokens; a local mock cannot prove that security effect.
- Manufacturer creation returns 202 + private receipt; poll using X-Job-Receipt, respect poll_after_ms, expiry and completed http_status (including failures). No password-change API inferred.
- Files are raw bytes (not multipart), 1 byte–10 MiB; filename 1–120 ASCII letters/digits/spaces/dots/hyphens/underscores, no paths or dot/dot-dot. Content types are limited to application/octet-stream, PDF, JSON, text/plain, PNG and JPEG; the newer handoff's ‘any type’ wording is broader than the handler, so the handler wins. Owners/admins may read.

## Architecture decision

Keep F1 production authentication/proxy unimplemented because roadmap session decisions remain open and no live backend is available. Default production staff access fails closed. An explicit server-only `AMTRAV_CONSOLE_DEMO=1` opt-in provides a conspicuously labeled fictional workspace and demo-role cookie, not an authentication token. The production sign-in never grants access using fake credentials. Demo data is instance-local, never a global mutable singleton; no access/refresh tokens or claim codes enter browser storage. Server pages enforce demo role restrictions, and the mock service independently scopes operations.

## Implemented structure and reuse

- `app/(staff)/` remains the server route boundary. `/` redirects to Devices; `/devices/new` is the added registration route. Existing `/devices/[id]` retains async params, Suspense, identifier sanitization and invalid-UUID handling. `/users` remains the Accounts URL; no duplicate `/accounts` page.
- `components/app-shell.tsx`, `section-page.tsx`, `nav-icon.tsx`, `role-badge.tsx` and `lib/admin-sections.ts` refine the existing F0 foundation. Navigation and the wire `admin` → UI `administrator` conversion stay centralized. No second shell or main landmark was added. Existing unrelated scaffold helpers were preserved.
- `components/console-ui.tsx` shares notices, errors, loading/empty states, labeled fields, status, pagination and native modal/confirmation behavior. Native modal state owns scroll locking through CSS; explicit trigger restoration fixes WebKit pointer focus. Cancel receives initial confirmation focus.
- `features/` contains focused Login, Devices, Registration, Details, Handoff, Accounts and Files implementations. `console-context.tsx` owns one mock service per fictional workspace and cancels stale resource/poll updates. The pathname boundary clears transient code views; the provider preserves local mutations between routes until refresh/sign-out or explicit preview reset.
- Existing `lib/api/types.ts` and F0 fixtures remain the transport baseline. `validation.ts` adds source-backed boundaries; `console-fixtures.ts` composes the current review dataset without changing default F0 fixtures. The mock service gains scoped mutations, audit records, asynchronous job progression and copied private file bytes. No HTTP adapter, auth framework, chart/map package or application dependency was added; `pnpm-lock.yaml` is unchanged.
- `scripts/register-typescript.mjs` uses pinned Node 24 native TypeScript support for the 16 API tests. `console-browser-qa.mjs` replays acceptance with externally installed Playwright and axe, without adding them to application dependencies. CI now runs `pnpm test:admin` in the existing lint job.

## Screens and behavior delivered

| Area | Working frontend behavior | Production dependency / limit |
| --- | --- | --- |
| Access | Required fields; invalid credentials, unavailable and rate-limited previews; pending; explicit demo entry; sign-out; missing-session guidance | No real sign-in, refresh, password reset or proxy. Default access remains closed; no invented cooldown when Retry-After is absent |
| Devices | Accessible inventory table; current-page search/status filter; limit/offset controls; row-to-detail navigation; loading/empty/retry | No server search, totals, analytics or live telemetry |
| Register / handoff | Serial normalization, UTF-8 metadata rules, manufacturer selection for admins, automatic own manufacturer, duplicates, one-time result, copy feedback, saved acknowledgement, guarded internal navigation | Codes are fixed **EXAMPLE ONLY** mock values. Browser history clears the result; closing/reloading cannot guarantee delivery or secure clipboard handling. Real one-time guarantees belong to backend |
| Details | Immutable identity/ownership, edit/cancel/save model and declared firmware, paginated UTC audit, eligible replacement, confirmed idempotent revoke | No nickname/owner/status edit, physical unlock/wipe or measured firmware. Only fictional records change |
| Accounts | Admin-only list, self/mobile read-only, confirmed compatible role changes, validated manufacturer request, queued/processing/completed/duplicate-failure UI | Private receipt stays in component state; poll cadence and expiry use receipt fields. No production account/email/token invalidation or first-login password API |
| Files | One-file select/drop, filename/MIME/size validation, local byte upload, owner-scoped listing, safe attachment download, pagination/errors | Downloads are harmless TXT/JSON examples or selected local files. No real PDF/certificate, server storage, file-device association or multipart transport |
| Manufacturer | Devices/Register/Files only; own inventory, automatic registration ownership, direct Accounts denial and cross-manufacturer 404s in service | All fixtures are fictional and may exist in the client bundle. These checks demonstrate the contract; they are not production data isolation |
| Shared | Semantic tables/regions, visible focus, native dialogs, Tab/Shift-Tab, Escape/backdrop, focus restoration, resize/history close, empty/loading/service/429/forbidden states | Automated axe is supplemented by interaction and screenshot inspection, not a claim of complete assistive-technology certification |

## Role and security review

The default process ignores even a forged demo cookie when the server flag is absent. Enabled previews identify themselves on every staff page and require fictional `.invalid` addresses in interactive credential forms. Email/password inputs are checked locally; only the fictional role reaches the demo-entry action. The demo cookie is HttpOnly/SameSite Strict, optionally Secure for HTTPS; it deliberately does not establish real authentication. `VERCEL_ENV=production` disables the preview flag. Other hosting environments must leave it off for production.

No real credentials, tokens or claim codes were used. No access/refresh token is issued by the console. Claim codes and job receipts are absent from URLs, browser storage and application logs. Original claim codes are not present in detail DTOs. Confirmations describe registry consequences without claiming physical bag actions. Error text is rendered as text, never raw HTML. Real F1 authorization must be enforced again by the server/backend; do not promote the preview cookie or mock service into an auth implementation.

## Visual audit and exact browser captures

Source access is incomplete: Figma metadata/context/screenshot calls hit the seat limit; the read-only browser fallback returned CloudFront 403. No source hierarchy, token values, current node-to-screen mapping or pixel geometry was fabricated. Supplied current MVP/state-sheet screenshots were inspected alongside actual browser renders. Older dashboard/chart/calendar/map/OTA screens were excluded. The existing marketing logo has a different badge/wordmark treatment, so the console retains its text wordmark pending the approved console asset; exact new logo/icon parity is not claimed.

The desktop split sign-in, navy/blue palette, light surfaces, approximately 248px sidebar, active route treatment, registry tables, two-column forms and explanatory cards follow the supplied current MVP reference. Deliberate differences are conspicuous preview labels, harmless example files, accessible controls and explicit source constraints. The handoff's “any type” file wording is narrowed to the real handler allowlist. Only the approved light palette is implemented; system dark preference keeps that palette. Skeleton animation respects reduced motion.

Screenshot inspection found and fixed mobile serial fragmentation, a truncated manufacturer role option, absolute screen-reader headers escaping table scrollers, an oversized visually hidden file input, WebKit drawer focus restoration, and the drawer-to-handoff-confirmation scroll-lock race. Loading moved to the page-content boundary to avoid pushing already-visible guidance as data arrives. Tables scroll within labeled focusable regions instead of overflowing the document. No global overflow clipping was used to conceal defects.

All links below are **actual browser screenshots**, not generated mockups. Desktop captures are 1440px, mobile captures 390px; the drawer is WebKit. Sixteen curated PNGs total about 1.7 MB; bulk screenshots, traces and raw JSON stay outside Git.

| Comparison / screen | Evidence |
| --- | --- |
| Original shell → registry, desktop | [Before](admin-console-screenshots/before-desktop.png) · [After](admin-console-screenshots/devices-desktop.png) |
| Original shell → registry, mobile | [Before](admin-console-screenshots/before-mobile.png) · [After / drawer closed](admin-console-screenshots/devices-mobile.png) · [Drawer open](admin-console-screenshots/drawer-mobile.png) |
| Access | [Sign-in](admin-console-screenshots/login-desktop.png) · [Default closed](admin-console-screenshots/default-closed.png) |
| Registration and details | [Register](admin-console-screenshots/register-desktop.png) · [Example handoff](admin-console-screenshots/handoff-example.png) · [Details](admin-console-screenshots/detail-desktop.png) |
| Administration | [Accounts](admin-console-screenshots/accounts-desktop.png) · [Files](admin-console-screenshots/files-desktop.png) |
| Scoped states | [Manufacturer desktop](admin-console-screenshots/manufacturer-desktop.png) · [Manufacturer mobile](admin-console-screenshots/manufacturer-mobile.png) · [Forbidden](admin-console-screenshots/forbidden.png) · [Empty](admin-console-screenshots/empty-devices.png) |

There is no numeric Figma pixel-diff score: without an accessible original frame/export, inventing one would be misleading. The remaining direct-source comparison is a design review item.

## Executed verification

All commands used Node 24.22.0 and pnpm 11.20.0 on 26 October 2026.

| Check | Actual result |
| --- | --- |
| `pnpm install --frozen-lockfile` | Pass; no lockfile/dependency changes |
| `pnpm lint:admin`, `pnpm lint:landing` | Pass; zero warnings |
| `pnpm --filter admin_panel exec tsc --noEmit` | Pass |
| `pnpm --filter landing_page exec tsc --noEmit` | Pass |
| `pnpm build:admin`, `pnpm build:landing` | Pass, optimized production builds |
| `pnpm test:admin` | 16/16: existing eight F0 tests plus eight source-validation, ownership, mutation/audit, role, job and file-byte regressions |
| `pnpm sprint:test` | 15/15; dry-run automation only, no issue changes |
| `pnpm sprint validate` | Six sprint definitions valid |
| Browser acceptance, Chrome | 818 checks, zero failures; 108 route/role/viewport cases plus 12 interaction groups and 14 axe audits |
| Browser acceptance, WebKit | 818 checks, zero failures; same matrix and interactions |
| axe WCAG A/AA tags including 2.2 | 28 state audits, zero violations; incomplete/manual items remain review responsibilities |
| `git diff --check` | Pass |

Widths: **320, 375, 390, 430, 768, 1024, 1280, 1440, 1920**. Each engine visits Login, Devices, Register, Details, Accounts and Files for administrator and manufacturer. Checks cover loaded Inter, one main/h1, document overflow, route highlighting, role navigation, direct denial, sticky header reachability, console/hydration/network errors and screenshots. Inter remains the computed UI font; identifiers/code keep JetBrains Mono. No font implementation change was needed.

Interaction groups cover sign-in validation/errors/pending without transmitting passwords; closed-default forged cookie; list/filter/page boundaries and edit/revoke; registration/duplicate/copy/replacement/history; confirmed roles and queued manufacturer jobs including duplicate failure; file validation/upload/download bytes; manufacturer scope; shared empty/service/429; drawer keyboard/Escape/backdrop/resize/history; mobile unsaved-code drawer transition; reduced motion/system dark preference; sign-out. Screens and service checks are mock acceptance, not live API integration.

Replay (external Playwright package and axe path required; no app dependencies installed):

```bash
# Start demo and closed production instances as documented in README.md.
AMTRAV_PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs \
AMTRAV_AXE_PATH=/absolute/path/to/axe-core/axe.min.js \
AMTRAV_CONSOLE_OUTPUT=/tmp/amtrav-console-qa \
node scripts/console-browser-qa.mjs
# Optional: AMTRAV_CONSOLE_ENGINES=chromium or webkit; --flows-only for focused replay.
```

Tested versions: Chrome 155.0.8059.86 and Playwright WebKit 27.2. The harness uses the installed Chrome channel and Playwright WebKit. Raw terminal evidence: `/private/tmp/amtrav-console-evidence/accepted-chromium/results.json` and `accepted-webkit/results.json` in the same directory. Earlier failed runs were diagnostic, not acceptance: they exposed overflow/focus, then the added mobile transition exposed scroll locking. Terminal results above include the fixes.

## Performance measurements and tradeoffs

Production localhost, 900px viewport height, headless browsers, no CPU/network throttling. These are local navigation observations, **not Lighthouse, INP, field Core Web Vitals or production-service benchmarks**. Baseline was the F0 skeleton; implemented screens perform additional client work and wait on a deliberate 120ms mock latency. Browser resource bytes are decoded JS observed on that navigation, not compressed transfer or a precise tree-shaken bundle report. Cache/prefetch and concurrent QA affect timing.

| Chrome route | 390px baseline → implemented LCP ms | 1440px baseline → implemented LCP ms | 1440px decoded JS baseline → implemented |
| --- | --- | --- | --- |
| Login | 116 → 56 | 48 → 56 | 482,177 → 477,194 bytes |
| Devices | 44 → 352 | 52 → 352 | 474,373 → 511,216 bytes |
| Accounts | 40 → 32 | 36 → 280 | 474,373 → 518,004 bytes |
| Files | 84 → 296 | 80 → 300 | 474,373 → 511,216 bytes |

The expanded interactive workspace costs roughly 37–44 KB more decoded JS on these desktop navigations. No new large library was added. Registration/detail decoding peaked around 522 KB in the measured 1440px session; future live integration should profile fixture removal and provider/feature chunking before setting production budgets. Initial loading placement produced mobile CLS around 0.16–0.28 in diagnostic runs. After correction, measured CLS is **0 across all 108 final Chrome cases**, including the smallest login. This does not guarantee zero shifts under every live-network/user condition.

## Remaining decisions and review checklist

- [x] Current MVP scope implemented and tested at the frontend/mock layer; speculative modules isolated outside navigation.
- [x] Original source worktrees and both backends preserved. `back/AMTRAV` source revision `2dc198d21f19366cb4ce4131e3f8675e8b14a122`; modular rewrite `0f27fd27b88b34a2c891c4da0dcee0abfcf1278e`. No backend build/run/migration/modification.
- [x] Marketing source and lockfile untouched; no new application dependencies, secrets, build output or bulk QA dumps in the review diff.
- [x] Source-shaped DTOs, ownership constraints, typed validation, native accessible dialogs and required local gates verified.
- [ ] Obtain accessible current Figma hierarchy/exports and the console logo/icon assets; finish exact geometry/token review. No exact parity claim.
- [ ] Resolve F1 production session/cookie/refresh/CSRF/proxy decisions, connect real transport and verify generated/live OpenAPI. Contracts remain source-derived.
- [ ] Verify live authorization, role-change token invalidation, job receipt lifecycle, private downloads and claim-code lifecycle against a running backend. Mock tests cannot establish these guarantees.
- [ ] Confirm manufacturer discovery beyond the first 50 accounts; current selector discloses its scope. No total-count/search endpoint was invented.
- [ ] Design/approve password reset/first-login password change, complaint resolution, map ingestion, notifications and OTA before implementation.
- [ ] Review the stacked diff against `feat/frontend-f0-consolidated`. PR #50 remains open/unmerged; retarget this branch to `main` only after #50 lands. No force-push, direct main push, merge, deployment or manual issue closure.

Git handoff: isolated worktree `AMTRAV-frontend-console`, branch `feat/admin-console-mvp`, base `21b213328a447c36c8bf29175371afe0b80cb779`. The PR records the exact commit and remote check results; this report intentionally does not embed its own self-referential commit hash. Related foundation issues #19, #20, #21 and font decision #38 remain governed by PR #50. This work does not mark production F1/F3/F4 acceptance complete.
