# Deployment

## Vercel (web + API)

- Auto-deploys from GitHub `main` (push = deploy). Custom domain `accessibility.ascent.partners`.
- `next.config.mjs` sets `serverExternalPackages` for `playwright`, `playwright-core`, `axe-core`,
  `surrealdb` (and, via the dependency, `accessibility-checker`).
- **No background work** — the API only enqueues; the worker does the crawl/scan.

## Fly.io worker

- Manual deploy: `flyctl deploy` (uses `fly.toml` + `Dockerfile`).
- Build: `pnpm worker:build` → `dist/worker.js` (esbuild, `--packages=external`).
- Run as `node dist/worker.js` — **never `tsx`** (it hangs resolving `playwright-core`
  subpath requires).
- Tuning env: `WORKER_POLL_INTERVAL_MS`, `WORKER_BATCH_SIZE`, `WORKER_SCAN_CONCURRENCY` (default 5
  = Browserless Prototyping cap), `WORKER_STALE_RUNNING_MINUTES`.

## Browserless.io

Remote headless Chromium. The scanner and PDF renderer use
`chromium.connectOverCDP(\`${BROWSERLESS_URL}?token=${BROWSERLESS_TOKEN}\`)`; `chromium.launch()`
is a local-dev-only fallback. No local Chromium anywhere.

## SurrealDB Cloud

Namespace `wcag-score`, database `main`. Credentials are in `~/.env.opencode` and Fly/Vercel
secrets.

## Schema migration

`pnpm db:migrate` runs `SCHEMA_STATEMENTS` from `src/db/schema.ts` (one-shot; `DEFINE TABLE`
fails on re-run). For field changes on the live `assessment` table, run
`DEFINE FIELD OVERWRITE <field> ON assessment TYPE <type> …` directly. The audit-report feature
adds the `evidence` table and the `assessment.comparison` field (see `data-model.md`).

## Secrets

`FLY_API_TOKEN` lives in `~/.env.opencode` and **contains a literal comma** — do not "fix" it.
Git identity must be `simonplmak-cloud@users.noreply.github.com` (the ID-only form breaks Vercel
deploys).

See [environment reference](env-reference.md) for the full variable list.
