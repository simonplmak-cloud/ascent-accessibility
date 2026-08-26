import { RecordId } from "surrealdb";
import { getDb } from "./index";

// Consolidated idempotent migration for the storage-quota + retention feature.
// All statements are DEFINE FIELD OVERWRITE / DEFINE TABLE so they are safe to
// re-run. The backfill (bytes, ownerId) and orphan cleanup are also re-runnable.
const STATEMENTS: string[] = [
  `DEFINE FIELD OVERWRITE bytes ON assessment TYPE int DEFAULT 0;`,

  `DEFINE FIELD OVERWRITE bytes ON evidence TYPE int DEFAULT 0;
DEFINE FIELD OVERWRITE ownerId ON evidence TYPE option<string> DEFAULT NONE;
DEFINE FIELD OVERWRITE compacted ON evidence TYPE bool DEFAULT false;
DEFINE INDEX OVERWRITE evidence_owner_idx ON evidence FIELDS ownerId;`,

  `DEFINE INDEX OVERWRITE audit_log_created_idx ON audit_log FIELDS createdAt;`,

  `DEFINE TABLE report_pdf SCHEMAFULL;
DEFINE FIELD assessmentId ON report_pdf TYPE string;
DEFINE FIELD ownerId ON report_pdf TYPE option<string> DEFAULT NONE;
DEFINE FIELD pdf ON report_pdf TYPE string;
DEFINE FIELD bytes ON report_pdf TYPE int DEFAULT 0;
DEFINE FIELD createdAt ON report_pdf TYPE datetime DEFAULT time::now();
DEFINE INDEX report_pdf_assessment_idx ON report_pdf FIELDS assessmentId;
DEFINE INDEX report_pdf_owner_idx ON report_pdf FIELDS ownerId;`,

  `DEFINE TABLE metrics SCHEMAFULL;
DEFINE FIELD storageBytes ON metrics TYPE int DEFAULT 0;
DEFINE FIELD queueDepth ON metrics TYPE int DEFAULT 0;
DEFINE FIELD failedScans24h ON metrics TYPE int DEFAULT 0;
DEFINE FIELD updatedAt ON metrics TYPE datetime DEFAULT time::now();`,
];

async function backfill(db: Awaited<ReturnType<typeof getDb>>): Promise<void> {
  // Bytes: image/base64 length is exact; HTML is approximate (string::len counts
  // chars, not UTF-8 bytes) but acceptable for legacy rows — runtime writes use
  // Buffer.byteLength and the compaction pass recomputes accurately. compacted is
  // set here too because SCHEMAFULL re-validates the whole record on any UPDATE
  // and pre-existing rows have compacted = NONE (bool field).
  await db
    .query("UPDATE evidence SET bytes = string::len(image) + string::len(html ?? ''), compacted = false")
    .collect();
  await db
    .query(
      "UPDATE assessment SET bytes = string::len(findings ?? '') + string::len(comparison ?? '') + string::len(log ?? '') + string::len(pages ?? '') + string::len(sitemapUrls ?? '') + string::len(pageSnapshots ?? '')",
    )
    .collect();

  // ownerId backfill — batched by assessment (a correlated subquery per row is
  // too slow on large evidence tables; a few thousand rows otherwise means
  // thousands of round-trips).
  const distinct = (await db
    .query("SELECT assessmentId FROM evidence WHERE ownerId IS NONE GROUP BY assessmentId")
    .json()
    .collect()) as unknown[];
  const aids = ((distinct[0] ?? []) as Array<{ assessmentId: string }>).map((r) => r.assessmentId);
  const owners = aids.length
    ? ((await db
        .query("SELECT id, ownerId FROM assessment WHERE id IN $ids", {
          ids: aids.map((a) => new RecordId("assessment", a.replace(/^assessment:/, ""))),
        })
        .json()
        .collect()) as unknown[])
    : [];
  const ownerByAssessment = new Map<string, string>();
  for (const row of (owners[0] ?? []) as Array<{ id: string; ownerId: string | null }>) {
    if (row.ownerId) ownerByAssessment.set(String(row.id), row.ownerId);
  }

  let backfilled = 0;
  for (const aid of aids) {
    const ownerId = ownerByAssessment.get(aid);
    if (!ownerId) continue;
    // No RETURN — returning full records would pull the large image/html blobs.
    const updated = (await db
      .query("UPDATE evidence SET ownerId = $ownerId WHERE assessmentId = $aid AND ownerId IS NONE", {
        ownerId,
        aid,
      })
      .json()
      .collect()) as unknown[];
    backfilled += ((updated[0] ?? []) as unknown[]).length;
  }
  console.log(`backfilled ownerId for ${backfilled} evidence row(s)`);

  // Orphan cleanup: evidence whose assessment no longer exists (from the
  // pre-cascade delete leak). Cascade helper keeps this in lockstep going forward.
  // No RETURN BEFORE — that would pull the deleted blobs into the response.
  const deleted = (await db
    .query("DELETE evidence WHERE assessmentId NOT IN (SELECT VALUE type::string(id) FROM assessment)")
    .json()
    .collect()) as unknown[];
  console.log(`deleted ${((deleted[0] ?? []) as unknown[]).length} orphaned evidence row(s)`);
}

async function main() {
  const db = await getDb();
  for (const statement of STATEMENTS) {
    try {
      await db.query(statement).collect();
      console.log("Applied:", statement.split("\n")[0]);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (/already exists/i.test(message)) {
        console.log("Skipped (already exists):", statement.split("\n")[0]);
        continue;
      }
      throw error;
    }
  }
  await backfill(db);
  await db.close();
  console.log("Storage quota migration complete");
  process.exit(0);
}

main().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
