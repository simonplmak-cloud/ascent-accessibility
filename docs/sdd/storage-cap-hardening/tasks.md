# Tasks

Dependencies: T1 → T2/T3/T4 → T5 → T6 → T7 → T8. T9 runs alongside each.

## T1 — Schema + migration (S)
- `src/db/schema.ts`: add `evidence.bytes/ownerId/compacted`, `assessment.bytes`, `report_pdf` + `metrics` tables, `audit_log.createdAt` index; `ScannedPage` already exists.
- `src/db/migrate-storage-quota.ts` (new): idempotent `DEFINE FIELD OVERWRITE`/`DEFINE TABLE` + re-runnable backfill (ownerId/bytes + orphan cleanup).

## T2 — evidence-repository (M)
- `create` computes `bytes`; `listByIds`; `deleteByAssessment`; `sumBytesByOwner`; `compacted` in `mapEvidence`.

## T3 — report-pdf-repository (S, new)
- `src/db/repository/report-pdf-repository.ts`: `create`, `findByAssessment`, `deleteByAssessment`, `sumBytesByOwner`.

## T4 — assessment-repository (M)
- `finalize` writes `assessment.bytes`; `sumBytesByOwner` (assessment term); cascade `deleteAssessmentAndEvidence` (assessment + evidence + report_pdf); `deleteExpired(before, batch)`; `countFailed24h`.

## T5 — worker capture + PDF render (L)
- `lib/evidence/screenshot.ts`: element PNG/`q85+`, page JPEG `q60` ≤1600px; thread `ownerId` into `NewEvidence`.
- `lib/evidence/optimize.ts` (new): `sharp` downscale/compress + `limitInputPixels`; compaction pass.
- `lib/assessment/index.ts`: thread `ownerId`; compute `assessment.bytes`; render+store PDF best-effort after audit backfill (uses `reportPdfRepository`).
- `lib/export/i18n.ts`: switch to static message imports.

## T6 — worker loop (M)
- `src/worker/index.ts`: wire metrics `recordScan`; Sentry init + `checkIn`; cleanup sweep (reports/audit_log/api_key/tokens; dry-run).

## T7 — Vercel API (L)
- `app/api/v1/assessments/route.ts`: quota check + pre-estimate → `409 STORAGE_QUOTA_EXCEEDED`.
- `app/api/v1/account/usage/route.ts` (new), `app/api/v1/health/route.ts` (new).
- `app/api/v1/assessments/[id]/route.ts`: owner-gate DELETE + cascade.
- `app/api/v1/assessments/[id]/export/route.ts`: serve-stored / on-demand fallback (runtime/maxDuration/dynamic), batched evidence.

## T8 — UI / i18n / beta (M)
- `messages/{en,zh-Hans,zh-Hant}.json`: quota/retention/expiry/beta keys.
- `lib/branding.ts` (`beta`), `components/ui/beta-badge.tsx` (new), `lib/navigation.ts`, assess/report/pricing/roadmap/faq/methodology pages.

## T9 — Tests (L)
- Unit: `storage-bytes`, `quota`, `retention`, `optimize`, `export` (extend), `report-document` (extend), `report-pdf` (new), `metrics` (extend), `i18n-locale` (extend), `assessment` (extend).
- Differential: `report-scale.ts`, `finalize-payload.ts`.
- E2E: `storage.spec.ts`, `export.spec.ts`, `marketing.spec.ts` (extend).
