# Contributing to Psychic spec helpers

`@rvoh/psychic-spec-helpers` provides the request (unit) and Puppeteer (feature) spec helpers used by [Psychic](https://github.com/rvohealth/psychic) apps. This repo contains the library (`src/`), a small Psychic test app it is exercised against (`test-app/`), a Vite/React client the feature specs drive in a browser (`client/`), and the specs (`spec/unit`, `spec/features`).

## Prerequisites

- **Node.js 26** (primary: CI's first lane and the release build) or **Node.js 24** (supported; CI runs every check on both). `engines.node` is `>=24`.
- **pnpm 12.14.0**, pinned with its integrity hash by `packageManager` in `package.json`. Either:
  - use corepack, then run `corepack enable`. On **Node 24**, the bundled corepack works from Node 24.12.0 onward; older Node 24 releases bundle a corepack (0.34.4 or earlier) that cannot launch pnpm 12, so every `pnpm` command fails with `MODULE_NOT_FOUND …/pnpm/12.14.0/bin/pnpm.cjs`. On those, run `npm i -g corepack@0.34.7` (or later) first. **Node 26 does not bundle corepack**: install it with `npm i -g corepack`. If an old corepack has already run once, it leaves a broken `pnpm/12.14.0` entry in its cache (`$COREPACK_HOME`, by default `~/.cache/node/corepack/v1/`) that a newer corepack keeps reusing; delete that entry. Or
  - use a standalone pnpm (for example `npm i -g pnpm`); pnpm 11 and later switch themselves to the `packageManager` version inside this repo.
- **PostgreSQL**, reachable with the settings in `.env.test` (CI uses Postgres 13). Both spec suites need it. Redis and MySQL are **not** needed: CI starts a Redis service, but nothing in this repo connects to it.
- **Firefox for Puppeteer** (feature specs only).
- **Port 3000 free** for feature specs: they start the client dev server on it, and the test app's server on `DEV_SERVER_PORT` (default `7778`).

## Setup

```sh
pnpm install --frozen-lockfile
(cd client && pnpm install --frozen-lockfile)   # needed for feature specs

cp .env.test.example .env.test
# Edit .env.test: set DB_USER to your local Postgres user (add DB_PASSWORD if your
# server needs one), and set APP_ENCRYPTION_KEY / LEGACY_APP_ENCRYPTION_KEY to the
# output of `pnpm psy g:encryption-key`.

pnpm psy db:reset            # drop, create, migrate, sync and seed the test database

# Feature specs only. pnpm-workspace.yaml denies Puppeteer's install script, so it
# never downloads a browser on its own:
pnpm puppeteer browsers install firefox
```

`pnpm psy …` runs the test app's CLI with `NODE_ENV=test`, which loads `.env.test`. After the first setup, `pnpm psy db:migrate` applies new migrations. `pnpm psy db:create` exits with an error if the database already exists.

## Running checks

| Command               | What it does                                                                                         | In CI (Node 26 and 24)  |
| --------------------- | ---------------------------------------------------------------------------------------------------- | ----------------------- |
| `pnpm lint`           | ESLint on `src/` and `spec/`, then `prettier . --check`                                              | yes                     |
| `pnpm format`         | `prettier . --write`                                                                                 | no                      |
| `pnpm build`          | Type-check and compile the library to `dist/`                                                        | yes                     |
| `pnpm build:test-app` | Type-check the test app and specs (replaces `dist/`; run `pnpm build` again if you need the library) | no                      |
| `pnpm uspec`          | Unit specs (`spec/unit`); needs Postgres                                                             | yes                     |
| `pnpm fspec`          | Feature specs (`spec/features`); needs Postgres, `client/` installed, Firefox, port 3000             | yes                     |
| `pnpm psy sync`       | Regenerate the test app's types, OpenAPI files and route cache                                       | yes, must leave no diff |

Both spec scripts accept vitest arguments, for example `pnpm uspec spec/unit/specRequest` or `pnpm fspec spec/features/click.spec.ts`. Set `HEADLESS=0` to watch feature specs in a visible browser. `pnpm client` runs the client app on its own in development mode.

CI (`.github/workflows/pr-checks.yml`) installs with `pnpm install --frozen-lockfile`, then runs the lint, build (`pnpm build`), unit spec and feature spec jobs, plus a job that runs `pnpm psy db:migrate --skip-sync` and `pnpm psy sync` and fails if that changes any file. If you change test-app models, serializers, controllers or routes, run `pnpm psy sync` and commit what it generates.

## Dependency updates and supply-chain policy

- There are two independent dependency graphs: the root (`package.json` + `pnpm-lock.yaml`) and `client/` (its own `package.json`, `pnpm-lock.yaml` and `pnpm-workspace.yaml`). Regenerate each manifest together with its own lockfile and commit both.
- The release-age cooldown lives in `pnpm-workspace.yaml`: `minimumReleaseAge: 4320` (3 days), with `@rvoh/*` excluded via `minimumReleaseAgeExclude` because we maintain those packages. `client/pnpm-workspace.yaml` declares the same cooldown itself, since `client/` does not inherit the root file. `.npmrc` holds registry settings only; pnpm ignores install policy there.
- `allowBuilds` in `pnpm-workspace.yaml` is a supply-chain allowlist (dependency install scripts are blocked by default). Keep it minimal and add an entry only with clear cause.
- Keep `packageManager` pinned to an exact pnpm version with its integrity hash.
- `@rvoh/dream`, `@rvoh/psychic` and `@rvoh/dream-spec-helpers` are dev dependencies for the test app; keep them on mutually compatible versions (`npm view @rvoh/dream peerDependencies`).

## Changes and pull requests

- Open pull requests against `main`; all CI checks above must pass. Reviewers come from `CODEOWNERS`.
- Start a new branch from `main` only once your current branch's work has merged. If it hasn't, decide first whether the new work builds on it; agents must stop and ask (see [Starting New Work](AGENTS.md#starting-new-work)).
- Describe both the problem and the solution in the PR, with an issue number if there is one.
- Add a `CHANGELOG.md` entry under the next version for any behavior or typing change. Releases are cut from a PR that bumps `version` in `package.json` and adds its `CHANGELOG.md` entry; a maintainer then publishes a GitHub release and the release workflow publishes to npm with provenance. See [RELEASING.md](RELEASING.md).
- A change that makes any existing caller stop compiling or behave differently, including removing a default or making an option required, is breaking. It needs the maintainers' approval, and a major version does not make it acceptable; see [Breaking Changes](AGENTS.md#breaking-changes) for what counts and how to check.
- Public error exports follow the rule in [AGENTS.md](AGENTS.md): export an error only when a Psychic application developer needs to throw it or should reasonably be able to catch it in an expected workflow.

## Reporting bugs

- **Do not open a GitHub issue for a security vulnerability**; follow the [security policy](SECURITY.md) instead.
- Search the [existing issues](https://github.com/rvohealth/psychic-spec-helpers/issues) first.
- If nothing matches, [open a new issue](https://github.com/rvohealth/psychic-spec-helpers/issues/new) with the package version, Node version, Postgres version, TypeScript version, a description of the problem and a replicable code example.

Thanks so much!

The Psychic team
