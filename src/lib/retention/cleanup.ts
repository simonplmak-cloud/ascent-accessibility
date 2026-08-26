import { RecordId } from "surrealdb";
import { query } from "@/db";
import { assessmentRepository } from "@/db/repository";
import { optimizeEvidenceImage } from "@/lib/evidence/optimize";

export interface CleanupOptions {
  dryRun: boolean;
  reportRetentionDays: number;
  auditLogRetentionDays: number;
  magicLinkTokenTtlMinutes: number;
  compactionEnabled: boolean;
}

export interface CleanupResult {
  deletedReports: number;
  deletedAuditLogs: number;
  deletedApiKeys: number;
  clearedTokens: number;
  compactedEvidence: number;
}

export function retentionCutoffIso(days: number, now = Date.now()): string {
  return new Date(now - days * 86_400_000).toISOString();
}

function daysAgoIso(days: number): string {
  return retentionCutoffIso(days);
}

export async function runCleanup(opts: CleanupOptions): Promise<CleanupResult> {
  const result: CleanupResult = {
    deletedReports: 0,
    deletedAuditLogs: 0,
    deletedApiKeys: 0,
    clearedTokens: 0,
    compactedEvidence: 0,
  };

  // 1. Expired reports (cascade assessment + evidence + report_pdf), bounded batches.
  const reportCutoff = daysAgoIso(opts.reportRetentionDays);
  for (;;) {
    const ids = await query<string>(
      "SELECT VALUE type::string(id) FROM assessment WHERE status IN ['completed', 'failed'] AND updatedAt < type::datetime($cutoff) LIMIT 100",
      { cutoff: reportCutoff },
    );
    if (ids.length === 0) break;
    for (const id of ids) {
      if (!opts.dryRun) await assessmentRepository.deleteAssessmentAndEvidence(id);
      result.deletedReports += 1;
    }
    if (ids.length < 100) break;
  }

  // 2. Expired API keys, purging their audit_log rows to avoid dangling record refs.
  const expiredKeys = await query<string>(
    "SELECT VALUE type::string(id) FROM api_key WHERE (expiresAt IS NOT NONE AND expiresAt < time::now()) OR status = 'revoked' LIMIT 500",
    {},
  );
  if (expiredKeys.length > 0) {
    const recordIds = expiredKeys.map((k) => new RecordId("api_key", k.replace(/^api_key:/, "")));
    if (!opts.dryRun) {
      await query("DELETE audit_log WHERE apiKeyId IN $keys", { keys: recordIds });
      await query("DELETE api_key WHERE id IN $keys", { keys: recordIds });
    }
    result.deletedApiKeys = expiredKeys.length;
  }

  // 3. audit_log by age. DELETE has no LIMIT in this SurrealDB version, so bound
  // it via a subquery.
  const auditCutoff = daysAgoIso(opts.auditLogRetentionDays);
  if (!opts.dryRun) {
    const rows = await query<Record<string, unknown>>(
      "DELETE audit_log WHERE id IN (SELECT VALUE id FROM audit_log WHERE createdAt < type::datetime($cutoff) LIMIT 1000) RETURN BEFORE",
      { cutoff: auditCutoff },
    );
    result.deletedAuditLogs = rows.length;
  }

  // 4. Unused magic-link tokens older than the TTL (computed cutoff in TS — a
  // bound duration string does not coerce to a SurrealDB duration).
  const tokenCutoff = new Date(Date.now() - opts.magicLinkTokenTtlMinutes * 60_000).toISOString();
  if (!opts.dryRun) {
    const rows = await query<Record<string, unknown>>(
      "UPDATE user_email SET magicLinkToken = NONE WHERE magicLinkToken IS NOT NONE AND createdAt < type::datetime($cutoff) RETURN AFTER",
      { cutoff: tokenCutoff },
    );
    result.clearedTokens = rows.length;
  }

  // 5. Compaction: re-encode uncompacted evidence (bounded batch).
  if (opts.compactionEnabled) {
    const batch = await query<{ id: string; image: string; mime: string; kind: string; html: string | null }>(
      "SELECT id, image, mime, kind, html FROM evidence WHERE compacted = false AND image != '' LIMIT 50",
      {},
    );
    for (const row of batch) {
      const optimized = await optimizeEvidenceImage(
        row.image,
        row.mime,
        row.kind as "page" | "element" | "snapshot",
      );
      const bytes = Buffer.byteLength(optimized.image) + (row.html ? Buffer.byteLength(row.html) : 0);
      if (!opts.dryRun) {
        await query(
          "UPDATE evidence SET image = $image, mime = $mime, bytes = $bytes, compacted = true WHERE id = type::record($id)",
          { image: optimized.image, mime: optimized.mime, bytes, id: row.id },
        );
      }
      result.compactedEvidence += 1;
    }
  }

  return result;
}

export async function computeStorageTotals(): Promise<{ evidence: number; assessment: number; reportPdf: number }> {
  const evidence = await query<{ total: number | null }>(
    "SELECT math::sum(bytes) AS total FROM evidence GROUP ALL",
    {},
  );
  const assessment = await query<{ total: number | null }>(
    "SELECT math::sum(bytes) AS total FROM assessment GROUP ALL",
    {},
  );
  const reportPdf = await query<{ total: number | null }>(
    "SELECT math::sum(bytes) AS total FROM report_pdf GROUP ALL",
    {},
  );
  return {
    evidence: evidence[0]?.total ?? 0,
    assessment: assessment[0]?.total ?? 0,
    reportPdf: reportPdf[0]?.total ?? 0,
  };
}
