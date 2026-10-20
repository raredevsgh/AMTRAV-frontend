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
- The `lint` and `build` checks must pass, and the branch must be up to date with `main`.
- PRs are **squash-merged**, and the branch is deleted automatically after merging.

## Dependencies

- Add or remove packages with `pnpm add` / `pnpm remove` inside the app folder (or `pnpm --filter <app> add <pkg>`), and always commit the updated `pnpm-lock.yaml`.
- Never edit `pnpm-lock.yaml` by hand. If it conflicts during a merge, take `main`'s version and run `pnpm install` to regenerate it.
- CI installs with `pnpm install --frozen-lockfile`, so a lockfile that doesn't match `package.json` fails the build.
- Dependabot opens grouped update PRs every Monday. Review them like any other PR; major Next.js/React upgrades are excluded and done deliberately.

## Line endings

`.gitattributes` keeps every text file as LF on all operating systems. If your editor shows whole-file diffs after cloning on Windows, run `git add --renormalize .` on a clean working tree.

## License

This repository is proprietary (see [LICENSE](LICENSE)). By contributing, you agree that your contributions are owned by the copyright holder under the same terms.
