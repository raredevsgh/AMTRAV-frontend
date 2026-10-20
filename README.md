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

Requires Node.js 20+ and pnpm 11 (`packageManager` is pinned in `package.json`).

```bash
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
