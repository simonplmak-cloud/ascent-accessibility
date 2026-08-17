# AGENTS.md

Web accessibility assessment platform for Ascent Partners. A visitor submits a domain + standard (WCAG 2.2 AA default); the system crawls the site (sitemap-first), runs axe-core in a self-hosted Chromium browser, and returns a score + findings + recommendations — exportable as PDF/CSV, with a live scan log, a Stripe subscription, and a donation page.

## Architecture (non-obvious — read first)

Split, DB-as-queue deployment. No background work on Vercel:

- **Vercel** (Next.js App Router) = marketing site + API only. `POST /api/v1/assessments` inserts a `queued` record into SurrealDB and returns `202`. It does not crawl or scan.
- **SurrealDB** = the job store. `assessment.status` (`queued → running → completed/failed`) *is* the queue.
- **Worker** (`src/worker/index.ts`, compiled Node container) runs on a **SWAS (Alibaba Cloud Simple Application Server) box in HK** (IP `47.243.145.140`), managed by systemd (`/opt/wcag-score`, unit `wcag-score-worker.service`). It polls SurrealDB every 1s, runs `runAssessment` (sitemap → crawl → scan → score → persist), appends a live log, and recovers stale `running` records.
- **Browserless** = the headless Chrome, **co-located on the same SWAS box** (Docker container `browserless`, image `ghcr.io/browserless/chromium`, unit `browserless.service`, bound to `127.0.0.1:3000`). `scanner-factory.ts` connects via `chromium.connectOverCDP(BROWSERLESS_URL?token=BROWSERLESS_TOKEN)`; if `BROWSERLESS_TOKEN` is unset it falls back to `chromium.launch()` (local dev only). The browser stays warm across worker deploys.

**Auth** is SurrealDB native (record access), not Clerk. `src/server/auth.ts` `getSessionUser()`/`getUserId()` return the user's **email** (used as `ownerId`/`userId`). `SESSION_COOKIE` (httpOnly JWT) for sessions; `ANON_COOKIE` gives anonymous visitors their own history. The root `layout.tsx` is async and resolves the role (signed-in / subscriber) for the role-aware header.

Key modules: `src/lib/assessment` (orchestration, DI-friendly), `src/lib/crawler`, `src/lib/scanner`, `src/lib/scoring`, `src/lib/recommendations`, `src/lib/export`, `src/db/repository`, `src/server/*` (SSRF, rate-limit, api-keys, stripe, scanner-factory, auth).

## Commands

```bash
pnpm check          # tsc --noEmit (SLOW ~2-4 min — surrealdb types are huge)
pnpm test           # vitest run (first run ~1-2 min "prepare")
pnpm build          # next build
pnpm worker:build   # esbuild bundle -> dist/worker.js (the real worker entrypoint)
pnpm db:migrate     # SurrealDB schema (tsx src/db/migrate.ts); db:migrate:live targets the live DB
pnpm worker         # LOCAL dev only (tsx); never in production
```

Verification order: `check` → `test` → `build`. Run a single test with `npx vitest run tests/unit/<file>.test.ts`.

## Critical gotchas (hard-won — an agent WILL hit these)

### SurrealDB
- **Record-ID lookups need a cast**: `WHERE id = $id` never matches; use `WHERE id = type::record($id)`.
- **`ORDER BY x` requires `x` in the projection** (`SELECT *` is fine; explicit field lists must include the sort field).
- **`SCHEMAFULL` can't bind arrays of objects** — `findings`, `log`, and `comparison` are stored as JSON strings (`TYPE option<string>`): `JSON.stringify` on write, `JSON.parse` on read.
- **`SCHEMAFULL` re-validates the whole record on any UPDATE** — a stale-typed field blocks unrelated updates. Change a type via `DEFINE FIELD OVERWRITE ...` on the live DB (plain `pnpm db:migrate` fails on "already exists").
- **Auth is namespace-scoped**: `db.signin({ namespace, username, password })`, not root sign-in.

### Worker / browser
- **Run the worker as `node dist/worker.js`, never `tsx`** (`tsx` hangs in Docker on `playwright-core`'s `chromium-bidi` subpath). The esbuild bundle **must** use `--packages=external`.
- **Inject axe-core via `page.addInitScript`, never `addScriptTag`** (`addScriptTag` is blocked by target-site CSP; `addInitScript` runs at CDP level).
- **A single bad page must never block the queue.** A page that hangs or crashes the browser previously stalled the whole worker (it awaits all claimed assessments). Now each page is wrapped in `WORKER_PAGE_TIMEOUT_MS` (default 180s); on timeout/crash/load-failure the worker closes + recreates the browser and skips that page (`src/lib/assessment/index.ts`). `appendLog` also touches `updatedAt` as a heartbeat so `recoverStaleRunning` (default 10 min) doesn't re-queue a scan that's still progressing.
- **Batch the persist + log writes.** `runAssessment` uses `assessmentRepository.finalize()` (one UPDATE writing score/passBand/findings/comparison/status) instead of the old `insertFindings` + `insertComparison` + `complete` (3 writes), and buffers the live log in memory, flushing it with `setLog()` (full overwrite, no read) every 300ms instead of the read+write `appendLog()`. The old methods still exist but `runAssessment` no longer calls them — keep new worker-side writes to the batched `finalize`/`setLog`.
- Env: `WORKER_POLL_INTERVAL_MS`, `WORKER_BATCH_SIZE`, `WORKER_SCAN_CONCURRENCY` (SWAS `.env` and `fly.toml` both set 2; code default 5), `WORKER_ASSESSMENT_CONCURRENCY`, `WORKER_STALE_RUNNING_MINUTES`, `WORKER_PAGE_TIMEOUT_MS`, `WORKER_BROWSER_POOL_SIZE`.

### Deployment
- **Vercel** auto-deploys from GitHub `main` (push = deploy). Custom domain `wcag-score.ascent.partners`.
- **Worker + Browserless (SWAS HK)** — the worker and a co-located Browserless run on one Alibaba Cloud Simple Application Server (HK, IP `47.243.145.140`), managed by systemd. Code + units live in `deploy/swas/`:
  - **Update** (already-provisioned box): SSH in, `git pull` + `pnpm worker:build` + `systemctl restart wcag-score-worker` (`deploy/swas/deploy.sh`).
  - **Fresh box from GitHub**: `deploy/swas/provision.sh` (installs node/pnpm/docker, clones, builds, generates a `BROWSERLESS_TOKEN`, writes `.env`, installs both systemd units, pulls the image, starts). Only the secrets are inputs (env vars — never committed).
  - **The worker `.env` must be UNQUOTED** — systemd `EnvironmentFile` doesn't strip quotes, and values must be free of `$`/spaces/`#` (this is why the live `/opt/wcag-score/.env` is unquoted). `browserless.service` sources the same `.env`, so the container token stays in sync with `BROWSERLESS_TOKEN`.
- **SurrealDB cloud** namespace `wcag-score`, database `main`. Credentials are in SWAS `/opt/wcag-score/.env` + Vercel secrets — never commit. (`~/.env.opencode` still points at the stale `valuation` namespace.)
- *(Deprecated but kept in repo: `fly.toml` and `browserless/fly.toml` for the old Fly worker + Fly Browserless — both Fly apps are stopped.)*

## Frontend conventions

- **Terminal theme**: dark monospace from `tailwind.config.ts` (`terminal.*` colors, `mono` font) + `globals.css`. Never reintroduce light-theme `neutral-*` classes.
- **Shared UI primitives in `src/components/ui/`** — `Button` (primary/outline/ghost) and `ButtonLink` (primary/outline), each with `sm/md/lg` sizes; plus `Card`, `PageShell`, `PageHeading`, `MutedText`, `InlineLink`. Every button, CTA, card, heading, and muted-text across the site is built on these — do **not** hand-roll `rounded bg-terminal-fg px-6 py-2 font-mono …` classes; use the primitive and pass one-off overrides via `className`.
- **The site targets WCAG 2.2 AAA** (7:1 body contrast), stricter than the tool's AA default.
- **Role-aware nav**: the header hides `History`/`Site scans`/`API access` from anonymous visitors (`API access` = subscribers only); the footer is content/legal links only.
- **Report components** in `src/components/assessment/`; pure helpers (`sortFindings`, `severityCounts`, `impactColor`) in `severity.ts` are node-unit-testable — the JSX components are **not** unit-tested (no jsdom), covered by the E2E axe scan.
- **Stripe**: embedded Checkout via the Payment Element (`ui_mode: "elements"`, `CheckoutElementsProvider` + `PaymentElement` in `src/components/checkout/embedded-checkout.tsx`), dark `night` appearance mapped to the terminal palette. Subscriptions (`$28/mo`, `STRIPE_SITE_PRICE_USD`), donations, and Customer Portal (`STRIPE_PORTAL_CONFIG_ID`).

## Testing

Unit tests (`tests/unit/*.test.ts`) are pure dependency-injected (in-memory fakes, no DB/browser/network); follow `AssessmentDeps`. E2E (`tests/e2e/*.spec.ts`, Playwright + `@axe-core/playwright`) needs a running app; not in `pnpm test`.

## Environment

Required: `SURREAL_URL/USERNAME/PASSWORD/NAMESPACE/DATABASE`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_SITE_URL`. Optional: `STRIPE_SITE_PRICE_USD`, `STRIPE_PORTAL_CONFIG_ID`, `WORKER_*`, `BROWSERLESS_URL/TOKEN` (fallback only). See `.env.example`.

## Misc

- **Git identity must be `simonplmak-cloud@users.noreply.github.com`** (username noreply); the ID-only form makes Vercel block deploys.
- `vdd/` and `constitution.md` are gitignored — local design docs, not part of the code repo.
- The editor LSP shows spurious "Cannot find module '@/…'" errors; `tsc`/Vitest resolve `@/*` → `src/*` correctly.
- Use `pnpm` only (never npm/yarn).
