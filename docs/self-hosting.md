# Self-hosting guide

Ascent Accessibility is a split deployment: a **web app** (Next.js, typically on
Vercel) + a **scan worker** (a Node container) + a **Browserless** (headless
Chromium) that must be co-located, with **SurrealDB** as the shared job store.
This guide walks through standing up the full stack from scratch.

## Architecture

```
                    POST /api/v1/assessments (enqueue)
Browser ────────────────────────────▶ Vercel (Next.js) ────────▶ SurrealDB
                                                            (assessment.status = queue)
                                                            ▲
Worker (node dist/worker.js) ─── polls every 1s ──────────────┘
   │  runs: crawl → scan (in-house engine) → score → persist
   ▼
Browserless (headless Chromium, 127.0.0.1:3000)
```

- The **web app** is a normal Next.js 15 App Router app — it never crawls or scans.
- **SurrealDB** is the queue: `assessment.status` (`queued → running → completed/failed`).
- The **worker** (`src/worker/index.ts`) polls SurrealDB, runs each assessment,
  and renders + stores the PDF report.
- **Browserless** provides the headless Chrome the worker drives.

## Prerequisites

- Node.js 20+, pnpm 10
- A SurrealDB database (cloud or self-hosted)
- A Linux box (any Ubuntu 22.04 host) with Docker, for the worker + Browserless
- (Optional) Stripe keys for subscriptions/donations; Resend for magic-link email;
  an OpenRouter/DashScope key for AI-assisted review

## 1. Environment variables

```bash
cp .env.example .env.local
```

Fill in the `SURREAL_*` block at minimum. See `.env.example` for the full list and
comments; the worker reads the same variables from its own `.env` (see step 3).

## 2. Deploy the web app

The app is a standard Next.js deploy. On Vercel: import the repo, set the env
vars, and deploy. Locally:

```bash
pnpm install
pnpm db:migrate        # apply the SurrealDB schema (idempotent)
pnpm dev
```

## 3. Provision the worker + Browserless

The `deploy/swas/` directory contains everything to stand up the scan tier on a
fresh Linux box (Alibaba Cloud SWAS or any Ubuntu host).

```bash
git clone <this-repo> /tmp/wcag-score
cd /tmp/wcag-score
SURREAL_URL=... SURREAL_USERNAME=... SURREAL_PASSWORD=... \
  deploy/swas/provision.sh
```

`provision.sh` installs Node 20 / pnpm 10 / Docker, builds `dist/worker.js`,
generates a `BROWSERLESS_TOKEN` if unset, writes the worker `.env`, installs both
systemd units (`wcag-score-worker.service`, `browserless.service`), pulls the
Browserless image, and starts both. It is idempotent.

Key detail: the worker `.env` is read by systemd `EnvironmentFile`, which does
**not** strip quotes — keep values unquoted and free of `$` / spaces / `#`.

## 4. Verify

```bash
systemctl status wcag-score-worker browserless
journalctl -u wcag-score-worker -f
```

Then submit a scan from the web app and watch the worker log.

## Local development

```bash
pnpm dev            # web app
pnpm worker         # worker (local dev only — tsx; production uses dist/worker.js)
pnpm test           # unit tests
pnpm check          # type-check
```

The worker falls back to `chromium.launch()` (no Browserless) when
`BROWSERLESS_TOKEN` is unset, so a single-machine dev setup works without Docker.
