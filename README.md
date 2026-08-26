# Ascent Accessibility

An open-source **web accessibility assessment platform** by
[Ascent Partners](https://www.ascent.partners). Submit a domain, and the system
crawls the site, runs an in-house accessibility engine in a headless browser,
and returns a **WCAG 2.2 score**, findings, recommendations, and an evidence-backed
**PDF report** — plus a free structured training course and a Stripe subscription.

Live: <https://accessibility.ascent.partners>

[![License: AGPL-3.0](https://img.shields.io/badge/license-AGPL--3.0-blue.svg)](LICENSE)

## What it does

- Crawls a site (sitemap-first) and scores it against WCAG 2.0/2.1/2.2 and Section 508.
- Runs the **Ascent Accessibility engine** — a clean-room, in-house rules engine
  (no third-party accessibility engine such as axe-core) — in a self-hosted Chromium.
- Resolves machine-untestable criteria with an optional **AI-assisted review**
  (bring-your-own-key or provisioned), with a hard confidence gate and a
  human-review tier for what AI cannot decide.
- Produces a report with per-criterion verdicts, evidence screenshots, and a
  **PDF** export.
- Free **training** path (`/training/*`) that issues a PDF certificate.

## Architecture

Split, DB-as-queue deployment — no background work on the serverless edge:

- **Web app** — Next.js 15 (App Router), TypeScript, Tailwind. Marketing + API only;
  `POST /api/v1/assessments` enqueues a job and returns `202`.
- **SurrealDB** — the job store; `assessment.status` (`queued → running →
  completed/failed`) *is* the queue.
- **Worker** (`src/worker/index.ts`, compiled Node) — polls SurrealDB, runs
  `runAssessment` (crawl → scan → score → persist), renders the PDF.
- **Browserless** — the headless Chromium, co-located with the worker.

See [`docs/self-hosting.md`](docs/self-hosting.md) for a full ground-up setup guide,
and [`docs/architecture/`](docs/architecture/) for the design decisions (ADRs).

## Stack

- **Framework:** Next.js 15, TypeScript (strict), Tailwind
- **Engine:** in-house clean-room accessibility rules (`src/lib/engine`)
- **Browser:** Playwright + Browserless (co-located, `chromium.connectOverCDP`)
- **Database:** SurrealDB (`SCHEMAFULL`, DB-as-queue)
- **Auth:** SurrealDB native — email magic-link + Google OAuth
- **Payments:** Stripe (subscriptions + donations)
- **Reports:** react-pdf (PDF only)

## Getting started

```bash
pnpm install
cp .env.example .env.local   # set the SURREAL_* vars at minimum
pnpm db:migrate              # apply the SurrealDB schema
pnpm dev
```

For the scan worker + Browserless tier, see
[`docs/self-hosting.md`](docs/self-hosting.md).

## Scripts

| Command | Purpose |
|---------|---------|
| `pnpm dev` | Start the dev server |
| `pnpm check` | Type-check (`tsc --noEmit`) |
| `pnpm lint` | Lint (eslint) |
| `pnpm test` | Unit tests (Vitest) |
| `pnpm test:e2e` | Playwright E2E (needs a running app) |
| `pnpm build` | Production build |
| `pnpm worker:build` | Bundle the worker (`dist/worker.js`) |
| `pnpm db:migrate` | Apply the SurrealDB schema |

## API

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/assessments` | Enqueue an assessment (returns `202`) |
| GET | `/api/v1/assessments` | List your assessments |
| GET | `/api/v1/assessments/:id` | Fetch status / report |
| DELETE | `/api/v1/assessments/:id` | Delete an assessment |
| GET | `/api/v1/assessments/:id/export?format=pdf` | Download the PDF report |
| POST | `/api/v1/api-keys` | Issue an API key (raw key returned once) |
| GET | `/api/v1/api-keys` | List keys (prefix only) |
| DELETE | `/api/v1/api-keys/:id` | Revoke a key |

Programmatic access uses `Authorization: Bearer <api-key>`.

## Environment variables

See [`.env.example`](.env.example) — the source of truth. Required at minimum:
`SURREAL_URL`, `SURREAL_USERNAME`/`SURREAL_PASSWORD` (or `SURREAL_TOKEN`),
`SURREAL_NAMESPACE`, `SURREAL_DATABASE`.

## Contributing

Contributions are welcome — see [`CONTRIBUTING.md`](CONTRIBUTING.md) and our
[`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md). Report security issues privately via
[`SECURITY.md`](SECURITY.md).

## License

[AGPL-3.0](LICENSE) — Ascent Partners Foundation.
