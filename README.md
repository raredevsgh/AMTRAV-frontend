# AMTRAV Frontend

pnpm workspace containing the AMTRAV web applications:

- **`landing_page`**: the public-facing landing page (Next.js 16 + React 19 + Tailwind CSS v4).
- **`admin_panel`**: the administrative dashboard (Next.js 16 + React 19 + Tailwind CSS v4).

The cloud backend lives in a separate, private repository.

## Project Structure

```
AMTRAV-frontend/
├── landing_page/       # Landing page web application
│   ├── app/
│   ├── public/
│   └── package.json
├── admin_panel/        # Admin panel web application
│   ├── app/
│   ├── public/
│   └── package.json
├── package.json        # Workspace scripts
└── pnpm-workspace.yaml # pnpm workspace definition
```

## Getting Started

Requires Node.js 24 (pinned in `.nvmrc`) and pnpm 11 (pinned in `package.json` as `packageManager`). See [CONTRIBUTING.md](CONTRIBUTING.md) for the full setup and workflow.

```bash
corepack enable   # once: use the pinned pnpm version
pnpm install

# Development servers (both default to port 3000; run one at a time or set PORT)
pnpm dev:landing
pnpm dev:admin

# Lint and production builds
pnpm lint:landing
pnpm lint:admin
pnpm build:landing
pnpm build:admin
```

## Admin Console review workspace

The Admin registry screens use an **explicit fictional demo**, not live authentication or a connected backend. The default staff routes fail closed. Production auth/proxy decisions remain in F1.

```bash
pnpm install --frozen-lockfile
pnpm build:admin
AMTRAV_CONSOLE_DEMO=1 pnpm --filter admin_panel start --port 3151
# Default closed instance for comparison, in another terminal:
pnpm --filter admin_panel start --port 3152
pnpm test:admin
```

At `/login`, use any fictional `.invalid` email and fictional password, then select a preview role. Inputs are checked locally; only the role selector reaches the demo server action. The HttpOnly cookie selects fictional data and is not an authentication credential. Preview changes reset on refresh/sign-out; no tokens, claim codes or private job receipts go into browser storage. Do not enable demo mode for a production service. `VERCEL_ENV=production` disables it even if the flag is set; use `AMTRAV_DEMO_HTTPS=1` for a preview served over HTTPS.

See [Admin Console implementation review](docs/engineering/ADMIN_CONSOLE_REVIEW.md) for architecture, source contract limits, screenshots, acceptance evidence and the external Playwright/axe replay command. No new application dependencies are required.

## License

Copyright (c) 2026 raredevsgh. All rights reserved. The source is publicly visible for reference only; see [LICENSE](LICENSE).
