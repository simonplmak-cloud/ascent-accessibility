# Plan (HOW)

See the design decisions and per-part details below; contracts in `contracts/api.md`, schema in `data-model.md`.

## Part A — accounting + backfill
3-term SUM by owner (`evidence.bytes + assessment.bytes + report_pdf.bytes`), indexed, no counter drift. Idempotent/re-runnable backfill + orphan-evidence cleanup. HTML: gzip full-page `evidence.html`, cap per-instance finding HTML.

## Part B — enforcement + advisory
Submit: rate → daily → quota → pre-estimate → SSRF → queue. `409 STORAGE_QUOTA_EXCEEDED`. Usage meter + retention notice + per-report expiry + Download-PDF CTA.

## Part C — PDF generate-once + hardened export
`report_pdf` table (own `ownerId`), worker renders best-effort after audit backfill; export serves stored, else on-demand (IP-rate-limited). Static i18n imports. `maxDuration=60`/nodejs.

## Part D — image reduction (worker-only sharp)
Element PNG/`q85+`; page JPEG `q60` ≤1600px; `limitInputPixels`; idempotent compaction (`compacted`) that also normalizes stragglers.

## Part E — delete-cascade + TTL
Owner-gated cascade delete (assessment+evidence+report_pdf). 180d report sweep (dry-run flag). `audit_log` purged by age AND purged-key refs; `api_key` expired/revoked; magic-link tokens TTL. Never touch accounts/subscriptions/training/AI-config.

## Part F — observability / Sentry
Wire metrics; upsert `metrics` record (`failedScans24h` from DB); `@sentry/node` with `beforeSend` scrubbing + cron `checkIn`. Per-user cap vs global-tier thresholds are distinct.

## Part G — beta labeling
`beta: true` toggle; `beta-badge` primitive; nav/assess/report/PDF/marketing surfaces; `beta.*` i18n.

## Rollout
Migration + backfill → worker deploy/restart → Vercel deploy → real scan → TTL dry-run → live.
