# Storage Cap & Operational Hardening

Status: Approved
Version: 1.0

## Overview

Bound per-user storage in SurrealDB (500 MB/user), reduce evidence image size, retain scan reports for 6 months, label the tool Beta, and harden the export/observability/cleanup paths so the tool runs smoothly under load.

## User stories

- As a platform operator I want a per-user storage cap so a single user cannot exhaust the shared SurrealDB tier.
- As a user I want to be told about the cap and the 6-month retention so I can download my report before it is deleted.
- As a user I want a downloadable PDF that stays small and always works, so I can keep a permanent copy.
- As an operator I want alerts when global storage, failure rate, or worker health crosses thresholds.

## Boundaries

**Always do** — parameterized SurrealQL only; enforce the cap at submit before queueing; keep stored PDFs separate from the `assessment` row; make migrations/backfill idempotent and re-runnable; owner-gate destructive endpoints.

**Never do** — store the PDF inline on `assessment`; log secrets/PII; auto-delete accounts, subscriptions, training credentials, or AI config; run a destructive TTL sweep without a dry-run flag.

## Acceptance criteria (MoSCoW)

### Storage cap
- [MUST] `POST /api/v1/assessments` rejects with `409 STORAGE_QUOTA_EXCEEDED` when the owner's committed usage ≥ `STORAGE_QUOTA_BYTES_PER_USER` (default 500 MiB).
- [MUST] A whole-site scan is rejected pre-queue when `usedBytes + pageCap × SCAN_PRE_ESTIMATE_BYTES_PER_PAGE > quota`.
- [MUST] Usage is the sum of `evidence.bytes + assessment.bytes + report_pdf.bytes` for the owner (indexed, no counter drift).
- [MUST] `GET /api/v1/account/usage` returns `{ usedBytes, quotaBytes, retentionDays }` for the authenticated owner.

### Image reduction
- [MUST] Element screenshots are stored PNG/JPEG `q85+`; page/context screenshots are JPEG `q60` at ≤1600px.
- [MUST] A compaction pass re-encodes evidence and recomputes `bytes`, idempotent via `evidence.compacted`.
- [SHOULD] `sharp` uses `limitInputPixels` to prevent decompression bombs.

### PDF
- [MUST] The worker renders the PDF (react-pdf) after the audit backfill and stores it in `report_pdf` (best-effort; a failed render never fails the assessment).
- [MUST] `GET …/export` serves the stored PDF when present, else renders on-demand (IP-rate-limited).
- [MUST] Total PDF ≤ ~4.5 MB (log truncated → images downscaled → images omitted, in that order).

### Retention & cleanup
- [MUST] Assessments + evidence + report_pdf older than 180 days are deleted by the worker sweep (dry-run flag available).
- [MUST] `DELETE /api/v1/assessments/[id]` is owner-gated and cascades evidence + report_pdf.
- [MUST] `audit_log` is purged by age and by purged `api_key` references (no dangling `record<api_key>`).

### Observability & beta
- [MUST] The worker emits a Sentry cron check-in each cycle; storage % and failure-rate thresholds raise Sentry alerts.
- [MUST] The product surfaces a "Beta" badge + disclaimer on nav, assess, report, PDF, and marketing entry points.

## Out of scope
- Pre-deletion email reminders; deleting accounts/subscriptions/training data; object-storage integration.
