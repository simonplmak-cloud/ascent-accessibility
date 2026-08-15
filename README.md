# Ascent Partners — Web Accessibility Assessment

A public website and industrial-grade accessibility assessment tool for
[Ascent Partners](https://www.ascent.partners). Submit a domain, select a
standard (WCAG 2.2 AA by default), and receive a scored report with findings,
recommendations, and PDF/CSV export — via the browser or a REST API.

## Stack

- **Framework:** Next.js 15 (App Router), TypeScript strict, Tailwind
- **Scanning:** Playwright + axe-core (server-side, per-page)
- **Crawling:** recursive same-origin crawler (depth ≤ 3, ≤ 100 pages, robots.txt)
- **Queue:** Upstash QStash (async crawl jobs with retries)
- **Database:** PostgreSQL (Vercel Postgres) + Drizzle ORM
- **Auth:** SHA-256-hashed API keys (Clerk optional)
- **Observability:** pino structured logs + metrics + audit log
- **Deployment:** Vercel (GitHub integration)

## Getting started

```bash
pnpm install
cp .env.example .env.local   # set DATABASE_URL, QSTASH_TOKEN, etc.
pnpm db:generate
pnpm db:migrate
pnpm dev
```

## Scripts

| Command | Purpose |
|---------|---------|
| `pnpm dev` | Start the dev server |
| `pnpm check` | Type-check (`tsc --noEmit`) |
| `pnpm test` | Run unit tests (Vitest) |
| `pnpm test:coverage` | Unit tests with coverage |
| `pnpm test:e2e` | Playwright E2E (requires `pnpm exec playwright install`) |
| `pnpm build` | Production build |
| `pnpm db:generate` / `pnpm db:migrate` | Drizzle schema → migrations |

## API

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/assessments` | Create an assessment (enqueues an async crawl) |
| GET | `/api/v1/assessments` | List assessments (newest first) |
| GET | `/api/v1/assessments/:id` | Poll status / fetch report |
| DELETE | `/api/v1/assessments/:id` | Delete an assessment |
| GET | `/api/v1/assessments/:id/export?format=pdf\|csv` | Export report |
| POST | `/api/v1/api-keys` | Issue an API key (raw key returned once) |
| GET | `/api/v1/api-keys` | List keys (prefix only) |
| DELETE | `/api/v1/api-keys/:id` | Revoke an API key |

Programmatic access uses `Authorization: Bearer <api-key>`.

## Environment variables

See `.env.example` — required: `DATABASE_URL`, `QSTASH_TOKEN`, `QSTASH_CURRENT_SIGNING_KEY`,
`QSTASH_NEXT_SIGNING_KEY`, `NEXT_PUBLIC_SITE_URL`. Optional: Clerk keys, `LOG_LEVEL`.

## Design & specs

The full spec-driven development chain lives in `vdd/` (vision, strategy, tactics,
spec, plan, data model, contracts, tasks, impact report).

## Disclaimer

This tool provides automated guidance. It is not a substitute for a certified or
manual accessibility audit.
