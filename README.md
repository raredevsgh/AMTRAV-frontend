# Amortrav frontend

Next.js frontend for the Amortrav public website and staff console. Uses Montserrat, Tailwind, shadcn/ui, Framer Motion, Zustand, React Hook Form, and TanStack Query.

## Run

```sh
pnpm install
cp .env.example .env.local
pnpm dev
```

Set `BACKEND_API_URL` to the backend's `/api/v1` address. The default matches the backend Compose gateway on port 8090. This is a server-only setting; credentials and API tokens must never use `NEXT_PUBLIC_` variables.

## Routes

- `/`: the AMTRAV TRACE landing page (`components/marketing/trace-landing.tsx`): the product film, the six features, how it works, the Smart Core, an app preview, a Journey Log demo, the range, security, battery, FAQ, and the Founding Traveller and investor/partner forms. `/features`, `/how-it-works` and `/for-brands` remain.
- `/api/leads`: the forms post here; it forwards only the expected fields to the API's `POST /public/leads` (same-origin, 8 KiB limit). Leads appear in the console.
- `/sign-in`: email/password sign-in for administrators and manufacturers.
- `/account-help`: account access guidance. No public staff signup or simulated password reset.
- `/console`: role-aware dashboard.
- `/console/devices`, `/console/devices/:id`, `/console/register`: inventory, detail, audit, registration, claim-code replacement, metadata edits, and revocation. For administrators a bag's page also shows its live state and Travel-Ready checks, its impact thresholds (editable), calibration history and recent impacts.
- `/console/fleet`, `/console/impacts`, `/console/alerts`, `/console/leads` (administrators): fleet health (battery, last heard, link, firmware, calibration, Theft Mode, journeys), impact review by severity, every alert sent to travellers with its read state, and website leads with CSV export.
- `/console/manufacturers`: administrator-only staff list, manufacturer creation, and role changes.
- `/console/files`: private uploads and downloads.
- `/console/firmware`: what the fleet runs as the bags report it (administrators), and the declared registry versions. OTA controls are not available yet.
- `/preview/admin`, `/preview/manufacturer`: development-only sample data. Mutations are disabled; these routes return 404 in production.

### Branding

The landing page's company, product and range names, logos and colours live in `lib/brand.ts`. Override them at build time without editing code: `NEXT_PUBLIC_BRAND_COMPANY`, `_PRODUCT`, `_SHORT_PRODUCT`, `_CORE`, `_APP`, `_WORDMARK`, `_MARK`, `_INK`, `_NIGHT`, `_SIGNAL`, `_ACCENT`, and `_RANGE_ESSENTIAL` / `_FLAGSHIP` / `_PRO` / `_EXECUTIVE`. The film and product images in `public/video` and `public/images/trace` are rendered from the app's 3D models (`mobile-app/scripts/bag-models/render-media.mjs`).

## Account rules

Administrators create manufacturer accounts. Mobile users sign up and log in with Google in the mobile app only. The console sends login requests directly; it polls private job receipts only for administrator-requested manufacturer creation.

A same-origin route handler forwards an explicit allowlist of operations to the backend. Access and refresh tokens stay in HttpOnly, SameSite cookies, with Secure enabled in production. Mutations require a matching Origin. Backend role and ownership checks remain authoritative. Client-side gates only control presentation. API responses are not cached. Zustand stores only UI filters.

Use HTTPS in production. The console requires an existing staff account to exercise live workflows. No credentials or production test accounts are bundled. The backend has no signed firmware releases or OTA controls yet; the UI says so rather than simulating success.

## Quality checks

```sh
pnpm format
pnpm format:check
pnpm lint
pnpm test
pnpm build
```

Keep components and styles formatted with Prettier; do not collapse JSX, functions, or CSS rules onto single lines. Gateway tests cover cookie handling, CSRF, role rejection, token refresh, logout failure, receipt privacy, and endpoint restrictions.

Public store links, legal documents, and partnership contact destinations still need final release information. Photography is copied from the supplied design. Verify remaining concourse and video credits before public launch.

### Admin fleet map

`/console/map` is admin-only; `/preview/admin/map` uses clearly labeled sample
positions. Manufacturer navigation excludes the map and direct visits are denied.
Location authorization also runs on the backend, independently of the UI.

Add `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.…` to `.env.local` with a Mapbox public token
restricted to the frontend's allowed URLs. Never use a secret `sk.*` token.
Mapbox supplies the basemap; device coordinates are drawn locally as GeoJSON, not
sent to a Mapbox dataset. Without a token the location list remains usable and
the map shows a setup state. A valid token and WebGL are required for map rendering.

Set `NEXT_PUBLIC_LOCATION_WS_URL=ws://localhost:8090/api/v1/admin/locations/stream`
for local development, or the deployed API's `wss://` URL for HTTPS pages. Restart
the development server or rebuild after changing public environment variables.
WebSocket traffic goes directly to the backend reverse proxy, not a Next.js route.
Deploy the backend location module/migration and its WebSocket proxy configuration
before using live mode.

The client requests a single-use ticket through the HttpOnly-cookie gateway,
then sends it as the first WebSocket message. Tokens/tickets never appear in URLs
or browser storage. Full snapshots replace existing state, repair reconnection
gaps and remove revoked devices. The client validates coordinates, reconnects with
backoff and fresh tickets, detects silent connections, and marks fixes older than
five minutes as last known. The stream is bounded to the latest 1,000 devices and
shows a notice when truncated. A connected stream is not a device-online signal.
Hardware firmware still needs to report positions through a trusted ingestion
service; no real telemetry is fabricated by the frontend.

### Offline mode and local SQLite

The console keeps a local SQLite database (`@sqlite.org/sqlite-wasm`, OPFS "SAH pool"
storage, run in `public/offline-db.worker.mjs`). `predev`/`prebuild`/`pretest` copy the
WebAssembly build into `public/sqlite/` (git-ignored). A production-only service worker
(`public/sw.js`) caches the app shell and static assets, never `/api/*` responses.

- **Stored locally:** the signed-in profile, devices, batches, staff list, device audit
  and (admins) the security audit trail. **Never stored:** tokens (HttpOnly cookies),
  claim codes, locations, MFA or session data, files. Data is scoped to one account,
  replaced when another account signs in, and wiped (with `secure_delete` + `VACUUM`) on
  sign-out, sign-out-everywhere and expired sessions. OPFS data is not encrypted at rest.
- **Offline edits:** only device model/firmware edits are queued (in the `outbox` table)
  and replayed on reconnect. Each carries the `updated_at` it was made against; the API
  refuses it with 409 if the device changed meanwhile, and the console rolls back and
  says so. Revoke, claim codes, batches, roles, MFA and sessions need a connection;
  mutations fail immediately offline rather than running later.
- **Optimistic UI:** device edits and revocations update every cached copy at once and
  roll back if the server rejects them.
- One tab owns the database at a time; other tabs fall back to in-memory storage.
