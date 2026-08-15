# AGENTS.md

Web accessibility assessment platform for Ascent Partners. A visitor submits a domain + standard (WCAG 2.2 AA default); the system crawls the site (sitemap-first), runs axe-core in a remote browser, and returns a score + findings + recommendations — exportable as PDF/CSV, with a live scan log and a Stripe donation page.

## Architecture (non-obvious — read first)

This is a **split, DB-as-queue** deployment. There is **no background work on Vercel**:

- **Vercel** (Next.js App Router) = marketing site + API only. `POST /api/v1/assessments` just inserts a `queued` record into SurrealDB and returns `202`. It does not crawl or scan.
- **SurrealDB** = the job store. The `assessment.status` field (`queued → running → completed/failed`) *is* the queue.
- **Fly.io worker** (`src/worker/index.ts`, a compiled Node container) polls SurrealDB every 5s for `queued` assessments, runs `runAssessment` (sitemap → crawl → scan → score → persist), appends a live progress **log** to the record, with a stale-`running` recovery step.
- **Browserless.io** (subscription) = the remote headless Chrome for both the axe-core scan and the PDF export. No local Chromium anywhere.

Key modules: `src/lib/assessment` (orchestration + log emission, DI-friendly), `src/lib/crawler` (sitemap + link crawl), `src/lib/scanner` (axe injection), `src/lib/scoring`, `src/lib/recommendations`, `src/lib/export`, `src/db/repository`, `src/server/*` (SSRF, rate-limit, API keys, validation, stripe, scanner-factory).

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
- **`SCHEMAFULL` cannot bind arrays of objects** (`SET field = $arrayOfObjects` throws `Found field '…[i].field'`). Both `assessment.findings` and `assessment.log` are stored as **JSON strings** (`TYPE option<string>`): `JSON.stringify` on write, `JSON.parse` on read (see `assessment-repository.ts`).
- **`SCHEMAFULL` re-validates the whole record on any UPDATE** — a stale-typed field blocks even unrelated updates. If you change/add a field type, run `DEFINE FIELD OVERWRITE <field> ON assessment TYPE <type> …` against the live DB (plain `pnpm db:migrate` fails on "already exists").
- **Auth is namespace-scoped**: `db.signin({ namespace, username, password })`, not root sign-in.

### Worker / browser
- **Run the worker as `node dist/worker.js` (built by `worker:build`), never `tsx`.** `tsx` hangs in Docker — it can't resolve `playwright-core`'s internal `chromium-bidi` subpath requires. The esbuild bundle **must** use `--packages=external`.
- **No `chromium.launch()`** in production. The scanner and PDF renderer both use `chromium.connectOverCDP(\`${BROWSERLESS_URL}?token=${BROWSERLESS_TOKEN}\`)`; `chromium.launch()` is a local-dev-only fallback (`src/server/scanner-factory.ts`).
- **Inject axe-core via `page.addInitScript`, never `addScriptTag`.** `addScriptTag` inlines the script and is blocked by strict `Content-Security-Policy` on target sites (scans fail). `addInitScript` runs at CDP level before the page loads and bypasses CSP (`src/server/scanner-factory.ts`).
- Worker tuning via env: `WORKER_POLL_INTERVAL_MS`, `WORKER_BATCH_SIZE`, `WORKER_SCAN_CONCURRENCY` (default 5 = Browserless Prototyping plan cap), `WORKER_STALE_RUNNING_MINUTES`.

### Deployment
- **Vercel** auto-deploys from GitHub `main` (push = deploy). Custom domain `wcag-score.ascent.partners`.
- **Fly.io worker** is manual: `flyctl deploy` (uses `fly.toml` + `Dockerfile`). Secrets via `fly secrets set`. `FLY_API_TOKEN` lives in `~/.env.opencode` — note it contains a **literal comma** (`FlyV1 fm2_…,fm2_…`); do not "fix" that.
- **SurrealDB cloud** namespace `wcag-score`, database `main`. Credentials (`SURREAL_URL/USERNAME/PASSWORD`) are in `~/.env.opencode` and Fly/Vercel secrets — never commit them.

## Frontend conventions

- **Terminal theme**: dark monospace, driven by `tailwind.config.ts` (`terminal.*` colors, `mono` font) + `globals.css` (dark body, focus ring). All pages use these — don't reintroduce light-theme `neutral-*` classes.
- **The site itself targets WCAG 2.2 AAA** (7:1 body contrast) — stricter than the AA default of the assessment tool. Contrast is verified by the axe self-scan, not by eyeballing.
- **Report components** live in `src/components/assessment/` (`ScoreSummary`, `FindingsGrid`, `LogPanel`, `Report`). Pure helpers (`sortFindings`, `severityCounts`, `impactColor`) live in `severity.ts` and are unit-testable in the node env — the JSX components are **not** unit-tested (no jsdom); they're covered by the E2E axe scan.
- **Stripe**: `POST /api/donate` creates a hosted Checkout session (`src/server/stripe.ts`) — no card data touches our server. Requires `STRIPE_SECRET_KEY`; returns a graceful 502 without it.

## Testing

Unit tests (`tests/unit/*.test.ts`, Vitest) are pure **dependency-injected** — in-memory fakes for repo/crawler/scanner/stripe, no DB, no browser, no network. New logic must follow this pattern (inject via `AssessmentDeps`, etc.). Component JSX is not unit-tested; pure logic is (see `severity.ts`). E2E (`tests/e2e/*.spec.ts`, Playwright) uses `@axe-core/playwright` for the a11y self-scan and needs a running app (`pnpm exec playwright install` + a live `next start`); not part of `pnpm test`.

## Environment

Required runtime env: `SURREAL_URL`, `SURREAL_USERNAME`, `SURREAL_PASSWORD`, `SURREAL_NAMESPACE`, `SURREAL_DATABASE`, `BROWSERLESS_URL`, `BROWSERLESS_TOKEN`; `STRIPE_SECRET_KEY` for donations; optional `WORKER_*`, `NEXT_PUBLIC_SITE_URL`. See `.env.example`.

## Misc

- **Git identity must be `simonplmak-cloud@users.noreply.github.com`** (username noreply). The ID-only form (`246365505@users.noreply.github.com`) makes Vercel block deploys ("could not associate the committer").
- `vdd/` (spec-driven design chain) and `constitution.md` are **gitignored** — local design docs, not part of the code repo.
- The editor LSP shows spurious "Cannot find module '@/…'" errors; ignore them — `tsc`/Vitest resolve `@/*` → `src/*` correctly via tsconfig paths.
- Use `pnpm` only (never npm/yarn).
