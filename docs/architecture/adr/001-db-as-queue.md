# ADR 001 — Database-as-queue (no background work on Vercel)

**Status:** Accepted

## Context
Vercel serverless functions cannot host long-running background jobs. A full-site crawl + scan
can take minutes.

## Decision
Use SurrealDB as the job queue: `POST /api/v1/assessments` inserts a `queued` record and returns
`202`. A separate Fly.io worker polls `queued` records and transitions
`queued → running → completed/failed`, with a stale-`running` recovery step.

## Consequences
- The queue is durable and needs no extra infrastructure.
- A crash mid-scan is recoverable via the stale-running sweep.
- The worker and web app share one schema/status model.
