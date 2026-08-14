# AGENTS.md

Web accessibility assessment platform for Ascent Partners. A visitor submits a domain + standard (WCAG 2.2 AA default); the system crawls the site, runs axe-core, and returns a score + findings + recommendations, exportable as PDF/CSV and queryable via a REST API.

## Architecture (non-obvious — read first)

This is a **split, DB-as-queue** deployment. There is **no background work on Vercel**:

- **Vercel** (Next.js App Router) = marketing site + API only. `POST /api/v1/assessments` just inserts a `queued` record into SurrealDB and returns `202`. It does not crawl or scan.
- **SurrealDB** = the job store. The `assessment.status` field (`queued → running → completed/failed`) *is* the queue.
- **Fly.io worker** (`src/worker/index.ts`, a compiled Node container) polls SurrealDB every 5s for `queued` assessments, runs `runAssessment` (crawl → scan → score → persist), with a stale-`running` recovery step.
- **Browserless.io** (subscription) = the remote headless Chrome for both the axe-core scan and the PDF export. No local Chromium anywhere.

Key modules: `src/lib/assessment` (orchestration, DI-friendly), `src/lib/crawler`, `src/lib/scanner`, `src/lib/scoring`, `src/lib/recommendations`, `src/lib/export`, `src/db/repository`, `src/server/*` (SSRF, rate-limit, API keys, validation).

## Commands

```bash
pnpm check          # tsc --noEmit (SLOW ~2-4 min — surrealdb types are huge)
pnpm test           # vitest run (first run ~1-2 min "prepare")
pnpm build          # next build
pnpm worker:build   # esbuild bundle -> dist/worker.js (the real worker entrypoint)
pnpm db:migrate     # SurrealDB schema (tsx src/db/migrate.ts)
pnpm worker         # LOCAL dev only (tsx); never in production
```

Verification order: `check` → `test` → `build`. These are slow; don't parallelize wildly. Run a single test with `npx vitest run tests/unit/<file>.test.ts`.

## Critical gotchas (hard-won — an agent WILL hit these)

### SurrealDB
- **Record-ID lookups need a cast**: `WHERE id = $id` never matches. Always use `WHERE id = type::record($id)`.
- **`ORDER BY x` requires `x` in the projection** (`SELECT *` is fine; explicit field lists must include the sort field or you get `Missing order idiom`).
- **`SCHEMAFULL` cannot bind arrays of objects** (`SET field = $arrayOfObjects` throws `Found field '…[i].field'`). `assessment.findings` is therefore stored as a **JSON string** (`TYPE option<string>`): `JSON.stringify` on write, `JSON.parse` on read (see `assessment-repository.ts`).
- **`SCHEMAFULL` re-validates the whole record on any UPDATE** — a stale-typed field blocks even unrelated updates. If you change a field type, purge/re-migrate old rows.
- **Auth is namespace-scoped**: `db.signin({ namespace, username, password })`, not root sign-in.

### Worker / browser
- **Run the worker as `node dist/worker.js` (built by `worker:build`), never `tsx`.** `tsx` hangs in Docker — it can't resolve `playwright-core`'s internal `chromium-bidi` subpath requires. The esbuild bundle **must** use `--packages=external`.
- **No `chromium.launch()`** in production. The scanner and PDF renderer both use `chromium.connectOverCDP(\`${BROWSERLESS_URL}?token=${BROWSERLESS_TOKEN}\`)`; `chromium.launch()` is a local-dev-only fallback (`src/server/scanner-factory.ts`).
- Worker tuning via env: `WORKER_POLL_INTERVAL_MS`, `WORKER_BATCH_SIZE`, `WORKER_SCAN_CONCURRENCY` (default 5 = Browserless Prototyping plan cap), `WORKER_STALE_RUNNING_MINUTES`.

### Deployment
- **Vercel** auto-deploys from GitHub `main` (push = deploy). Custom domain `wcag-score.ascent.partners`.
- **Fly.io worker** is manual: `flyctl deploy` (uses `fly.toml` + `Dockerfile`). Secrets via `fly secrets set`. `FLY_API_TOKEN` lives in `~/.env.opencode` — note it contains a **literal comma** (`FlyV1 fm2_…,fm2_…`); do not "fix" that.
- **SurrealDB cloud** namespace `wcag-score`, database `main`. Credentials (`SURREAL_URL/USERNAME/PASSWORD`) are in `~/.env.opencode` and Fly/Vercel secrets — never commit them.

## Testing

Unit tests (`tests/unit/*.test.ts`, Vitest) are pure **dependency-injected** — in-memory fakes for repo/crawler/scanner, no DB, no browser, no network. New logic must follow this pattern (inject via `AssessmentDeps`, etc.). E2E (`tests/e2e/*.spec.ts`, Playwright) needs a running app; not part of `pnpm test`.

## Environment

Required runtime env: `SURREAL_URL`, `SURREAL_USERNAME`, `SURREAL_PASSWORD`, `SURREAL_NAMESPACE`, `SURREAL_DATABASE`, `BROWSERLESS_URL`, `BROWSERLESS_TOKEN`; optional `WORKER_*`, `NEXT_PUBLIC_SITE_URL`. See `.env.example`.

## Misc

- **Git identity must be `simonplmak-cloud@users.noreply.github.com`** (username noreply). The ID-only form (`246365505@users.noreply.github.com`) makes Vercel block deploys ("could not associate the committer").
- `vdd/` (spec-driven design chain) and `constitution.md` are **gitignored** — local design docs, not part of the code repo.
- The editor LSP shows spurious "Cannot find module '@/…'" errors; ignore them — `tsc`/Vitest resolve `@/*` → `src/*` correctly via tsconfig paths.
- Use `pnpm` only (never npm/yarn).
