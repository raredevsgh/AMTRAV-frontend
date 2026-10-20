# Contributing to AMTRAV Frontend

## One-time setup

1. **Node.js 24** — the version is pinned in `.nvmrc` (`nvm use` / `fnm use` picks it up).
2. **pnpm via Corepack** — run `corepack enable` once. pnpm then uses exactly the version pinned in `package.json` (`packageManager`), so everyone gets identical installs.
3. **GitHub access** — make sure git pushes with your own GitHub account:
   ```bash
   gh auth login        # sign in as yourself
   gh auth setup-git    # let git use that login for github.com
   ```
   A `403` on push usually means git is using a different stored account.
4. Install dependencies:
   ```bash
   pnpm install
   ```
5. **Secret protection** — install [gitleaks](https://github.com/gitleaks/gitleaks) and enable the repository's pre-commit hook (once per clone):
   ```bash
   winget install Gitleaks.Gitleaks      # Windows (macOS: brew install gitleaks)
   git config core.hooksPath .githooks
   ```
   The hook refuses commits that contain `.env` files, private keys or certificates, and scans staged changes for API keys, tokens and passwords.

## Workflow

1. Branch from an up-to-date `main`:
   ```bash
   git switch main && git pull
   git switch -c <type>/<short-description>   # e.g. feat/landing-hero, fix/admin-login-redirect
   ```
2. Commit in small, focused steps. Commit messages: imperative mood, first line under 72 characters (e.g. `Add pricing section to landing page`).
3. Before pushing, run the same checks as CI:
   ```bash
   pnpm lint:landing && pnpm lint:admin
   pnpm build:landing && pnpm build:admin
   ```
4. Push and open a pull request into `main`. Fill in the PR template.

## Rules for `main`

`main` is protected:
- Changes land only through pull requests; direct and force pushes are blocked.
- The `lint`, `build` and `secrets` checks must pass, and the branch must be up to date with `main`.
- PRs are **squash-merged**, and the branch is deleted automatically after merging.

## Dependencies

- Add or remove packages with `pnpm add` / `pnpm remove` inside the app folder (or `pnpm --filter <app> add <pkg>`), and always commit the updated `pnpm-lock.yaml`.
- Never edit `pnpm-lock.yaml` by hand. If it conflicts during a merge, take `main`'s version and run `pnpm install` to regenerate it.
- CI installs with `pnpm install --frozen-lockfile`, so a lockfile that doesn't match `package.json` fails the build.
- Dependabot opens grouped update PRs every Monday. Review them like any other PR; major Next.js/React upgrades are excluded and done deliberately.

## Secrets and `.env` files

- Never commit secrets: API keys, tokens, passwords, private keys, or `.env` / `.env.local` files. `.gitignore` excludes them, the pre-commit hook blocks them, and the CI `secrets` job fails any PR that contains them anywhere in its history.
- Put local configuration in `.env.local` (ignored). If an app needs documented variables, commit a `.env.example` with names and harmless placeholder values only.
- Anything prefixed `NEXT_PUBLIC_` is bundled into the browser and is public by definition. Never put a secret in a `NEXT_PUBLIC_` variable.
- Do not bypass the hook with `git commit --no-verify`.
- **If a secret is ever committed or pushed:** treat it as compromised. Revoke or rotate it immediately at its provider, then tell the repository owner. Deleting the file or the commit is not enough: this repository is public, and the secret stays in git history, forks and caches.
- A false positive can be allow-listed by adding its fingerprint (printed by gitleaks) to a `.gitleaksignore` file, with a review in the PR.

## Line endings

`.gitattributes` keeps every text file as LF on all operating systems. If your editor shows whole-file diffs after cloning on Windows, run `git add --renormalize .` on a clean working tree.

## License

This repository is proprietary (see [LICENSE](LICENSE)). By contributing, you agree that your contributions are owned by the copyright holder under the same terms.
