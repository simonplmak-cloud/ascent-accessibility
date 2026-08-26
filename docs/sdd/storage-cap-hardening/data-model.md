# Data Model

## `evidence` (existing table — new fields)
| field | type | notes |
|---|---|---|
| bytes | int default 0 | `image.length + (html?.length ?? 0)`; computed in `create` |
| ownerId | option<string> | denormalized from the assessment; indexed |
| compacted | bool default false | compaction idempotency marker |

Indexes: `evidence_owner_idx ON evidence FIELDS ownerId`.

## `assessment` (existing table — new field)
| field | type | notes |
|---|---|---|
| bytes | int | serialized `findings`+`comparison`+`log`+`pages`+`sitemapUrls`+`pageSnapshots` lengths; set once at `finalize` |

## `report_pdf` (new table, SCHEMAFULL)
| field | type | notes |
|---|---|---|
| assessmentId | string | |
| ownerId | string | indexed (direct per-owner SUM) |
| pdf | string | base64 |
| bytes | int | base64 length |
| createdAt | datetime default now | |

Indexes: `report_pdf_owner_idx ON report_pdf FIELDS ownerId`, `report_pdf_assessment_idx ON report_pdf FIELDS assessmentId`.

## `metrics` (new table, single upserted record)
| field | type |
|---|---|
| id | record (fixed `metrics:latest`) |
| storageBytes | int |
| queueDepth | int |
| failedScans24h | int |
| updatedAt | datetime |

## Migration
One consolidated `src/db/migrate-storage-quota.ts` with idempotent `DEFINE FIELD OVERWRITE` / `DEFINE TABLE`, plus a re-runnable backfill:
- `evidence.ownerId` via assessment join; `evidence.bytes` = lengths; `assessment.bytes` = serialized lengths.
- Delete orphaned `evidence` with no matching `assessmentId` (via the shared cascade helper).
- Compaction (and a backfill re-run) normalizes any `bytes=0` / `ownerId=null` stragglers from the migrate→restart window.
