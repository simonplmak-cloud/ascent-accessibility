import { getDb, query, withDbRetry } from "../index";
import type { Assessment, Finding, LogEntry, NewAssessment, PassBand, ScannedPage } from "../schema";

export interface CompleteAssessmentInput {
  conformance: "conforms" | "does-not-conform" | "undetermined";
  scsMet: number;
  scsApplicable: number;
  pagesScanned: number;
  partial: boolean;
}
export interface AssessmentSummary {
  id: string;
  url: string;
  standard: string;
  standardLabel: string | null;
  status: Assessment["status"];
  score: number | null;
  passBand: PassBand | null;
  conformance: string | null;
  scsMet: number | null;
  scsApplicable: number | null;
  pagesScanned: number;
  partial: boolean;
  blockReason: string | null;
  createdAt: string;
  updatedAt: string;
}

const SUMMARY_PROJECTION =
  "id, url, standard, standardLabel, status, score, passBand, conformance, scsMet, scsApplicable, pagesScanned, partial, blockReason, createdAt, updatedAt";

function mapSummary(raw: Record<string, unknown>): AssessmentSummary {
  return {
    id: String(raw.id),
    url: String(raw.url),
    standard: String(raw.standard),
    standardLabel: (raw.standardLabel as string | null) ?? null,
    status: raw.status as Assessment["status"],
    score: raw.score == null ? null : Number(raw.score),
    passBand: (raw.passBand as PassBand | null) ?? null,
    conformance: (raw.conformance as string | null) ?? null,
    scsMet: raw.scsMet == null ? null : Number(raw.scsMet),
    scsApplicable: raw.scsApplicable == null ? null : Number(raw.scsApplicable),
    pagesScanned: Number(raw.pagesScanned ?? 0),
    partial: Boolean(raw.partial),
    blockReason: (raw.blockReason as string | null) ?? null,
    createdAt: String(raw.createdAt),
    updatedAt: String(raw.updatedAt),
  };
}

export const MAX_LOG_ENTRIES = 500;

async function readLogRaw(id: string): Promise<LogEntry[]> {
  const rows = await query<{ log: string }>(
    "SELECT log FROM assessment WHERE id = type::record($id) LIMIT 1",
    { id },
  );
  const raw = rows[0]?.log;
  if (!raw) return [];
  try {
    return JSON.parse(raw) as LogEntry[];
  } catch {
    return [];
  }
}

export const assessmentRepository = {
  async create(input: NewAssessment): Promise<Assessment> {
    const rows = await query<Assessment>("CREATE assessment CONTENT $data", {
      data: input,
    });
    return rows[0]!;
  },

  async findById(id: string): Promise<Assessment | undefined> {
    const rows = await query<Assessment>(
      "SELECT * FROM assessment WHERE id = type::record($id) LIMIT 1",
      { id },
    );
    return rows[0];
  },

  async setStatus(id: string, status: Assessment["status"]): Promise<void> {
    await query(
      "UPDATE assessment SET status = $status, updatedAt = time::now() WHERE id = type::record($id)",
      { id, status },
    );
  },

  async complete(id: string, input: CompleteAssessmentInput): Promise<void> {
    await query(
      "UPDATE assessment SET status = 'completed', conformance = $conformance, scsMet = $scsMet, scsApplicable = $scsApplicable, pagesScanned = $pagesScanned, partial = $partial, updatedAt = time::now() WHERE id = type::record($id)",
      { id, ...input },
    );
  },

  // One UPDATE for the whole result — replaces insertFindings + insertComparison
  // + complete (three round-trips) with a single write.
  async finalize(
    id: string,
    input: CompleteAssessmentInput & {
      findings: Finding[];
      comparison: unknown;
      snapshotAt: string;
      pageSnapshots: Record<string, { screenshotEvidenceId: string | null; htmlEvidenceId: string | null }>;
      pages: ScannedPage[];
      sitemapUrls: string[];
      detectedLanguages: string[];
    },
  ): Promise<void> {
    const findingsJson = JSON.stringify(input.findings);
    const comparisonJson = JSON.stringify(input.comparison);
    const pageSnapshotsJson = JSON.stringify(input.pageSnapshots);
    const pagesJson = JSON.stringify(input.pages);
    const sitemapUrlsJson = JSON.stringify(input.sitemapUrls);
    const detectedLanguagesJson = JSON.stringify(input.detectedLanguages);
    const bytes =
      Buffer.byteLength(findingsJson) +
      Buffer.byteLength(comparisonJson) +
      Buffer.byteLength(pageSnapshotsJson) +
      Buffer.byteLength(pagesJson) +
      Buffer.byteLength(sitemapUrlsJson);

    await query(
      "UPDATE assessment SET status = 'completed', conformance = $conformance, scsMet = $scsMet, scsApplicable = $scsApplicable, pagesScanned = $pagesScanned, partial = $partial, findings = $findings, comparison = $comparison, snapshotAt = $snapshotAt, pageSnapshots = $pageSnapshots, pages = $pages, sitemapUrls = $sitemapUrls, detectedLanguages = $detectedLanguages, bytes = $bytes, updatedAt = time::now() WHERE id = type::record($id)",
      {
        id,
        conformance: input.conformance,
        scsMet: input.scsMet,
        scsApplicable: input.scsApplicable,
        pagesScanned: input.pagesScanned,
        partial: input.partial,
        findings: findingsJson,
        comparison: comparisonJson,
        snapshotAt: input.snapshotAt,
        pageSnapshots: pageSnapshotsJson,
        pages: pagesJson,
        sitemapUrls: sitemapUrlsJson,
        detectedLanguages: detectedLanguagesJson,
        bytes,
      },
    );
  },

  async fail(id: string): Promise<void> {
    await query(
      "UPDATE assessment SET status = 'failed', updatedAt = time::now() WHERE id = type::record($id)",
      { id },
    );
  },

  // Terminal "blocked" state: every attempted page was blocked by bot/WAF
  // protection (403/429), so the scan could not proceed. Distinct from `failed`
  // (an orchestration/engine error) — blocked means the target denied access.
  async block(id: string, input: { reason: string; pages: ScannedPage[] }): Promise<void> {
    await query(
      "UPDATE assessment SET status = 'blocked', blockReason = $reason, pages = $pages, pagesScanned = 0, partial = false, updatedAt = time::now() WHERE id = type::record($id)",
      { id, reason: input.reason, pages: JSON.stringify(input.pages) },
    );
  },

  async insertFindings(id: string, findings: Finding[]): Promise<void> {
    await query("UPDATE assessment SET findings = $findings WHERE id = type::record($id)", {
      id,
      findings: JSON.stringify(findings),
    });
  },

  async insertComparison(id: string, comparison: unknown): Promise<void> {
    await query(
      "UPDATE assessment SET comparison = $comparison WHERE id = type::record($id)",
      { id, comparison: JSON.stringify(comparison) },
    );
  },

  async findComparison<T>(id: string): Promise<T | null> {
    const rows = await query<{ comparison: string }>(
      "SELECT comparison FROM assessment WHERE id = type::record($id) LIMIT 1",
      { id },
    );
    const raw = rows[0]?.comparison;
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },

  async findFindings(id: string): Promise<Finding[]> {
    const rows = await query<{ findings: string }>(
      "SELECT findings FROM assessment WHERE id = type::record($id) LIMIT 1",
      { id },
    );
    const raw = rows[0]?.findings;
    if (!raw) return [];
    try {
      return JSON.parse(raw) as Finding[];
    } catch {
      return [];
    }
  },

  async getAttempts(id: string): Promise<number> {
    const rows = await query<{ attempts: number }>(
      "SELECT attempts FROM assessment WHERE id = type::record($id) LIMIT 1",
      { id },
    );
    return rows[0]?.attempts ?? 0;
  },

  async incrementAttempts(id: string): Promise<void> {
    await query("UPDATE assessment SET attempts = attempts + 1 WHERE id = type::record($id)", {
      id,
    });
  },

  async list(ownerId?: string | null, limit = 500): Promise<AssessmentSummary[]> {
    if (!ownerId) return [];
    const rows = await query<Record<string, unknown>>(
      `SELECT ${SUMMARY_PROJECTION} FROM assessment WHERE ownerId = $ownerId ORDER BY createdAt DESC LIMIT $limit`,
      { ownerId, limit },
    );
    return rows.map(mapSummary);
  },

  async listByUrl(url: string): Promise<AssessmentSummary[]> {
    const rows = await query<Record<string, unknown>>(
      `SELECT ${SUMMARY_PROJECTION} FROM assessment WHERE url = $url AND status = 'completed' ORDER BY createdAt ASC`,
      { url },
    );
    return rows.map(mapSummary);
  },

  async delete(id: string): Promise<boolean> {
    const rows = await query<Record<string, unknown>>(
      "DELETE assessment WHERE id = type::record($id) RETURN BEFORE",
      { id },
    );
    return rows.length > 0;
  },

  async findQueued(limit = 5): Promise<Assessment[]> {
    return query<Assessment>(
      "SELECT * FROM assessment WHERE status = 'queued' ORDER BY createdAt ASC LIMIT $limit",
      { limit },
    );
  },

  // Atomically claim up to `limit` queued assessments (queued → running) and
  // return the claimed summaries. Uses a transaction (SurrealDB's `IN` with a
  // LIMIT subquery is not honored, so the LIMIT is evaluated via LET first).
  // Concurrent workers cannot claim the same assessment.
  async claimNext(limit = 5): Promise<AssessmentSummary[]> {
    return withDbRetry(async () => {
      const db = await getDb();
      const results = (await db
        .query(
          `BEGIN TRANSACTION;
           LET $ids = (SELECT VALUE id FROM assessment WHERE status = 'queued' ORDER BY createdAt ASC LIMIT $limit);
           UPDATE assessment SET status = 'running', updatedAt = time::now() WHERE id IN $ids RETURN AFTER;
           COMMIT TRANSACTION;`,
          { limit },
        )
        .json()
        .collect()) as unknown[];

      const claimed = results.find(
        (r): r is Array<Record<string, unknown>> => Array.isArray(r) && r.length > 0,
      );
      return (claimed ?? []).map(mapSummary);
    });
  },

  async countQueued(): Promise<number> {
    const rows = await query<{ count: number }>(
      "SELECT count() AS count FROM assessment WHERE status = 'queued' GROUP ALL",
      {},
    );
    return rows[0]?.count ?? 0;
  },

  async recoverStaleRunning(cutoffIso: string): Promise<void> {
    await query(
      "UPDATE assessment SET status = 'queued' WHERE status = 'running' AND updatedAt < type::datetime($cutoff)",
      { cutoff: cutoffIso },
    );
  },

  async readLog(id: string): Promise<LogEntry[]> {
    return readLogRaw(id);
  },

  async appendLog(id: string, entries: LogEntry[]): Promise<void> {
    if (entries.length === 0) return;
    const merged = [...(await readLogRaw(id)), ...entries].slice(-MAX_LOG_ENTRIES);
    // Also touch updatedAt as a heartbeat so recoverStaleRunning (which resets
    // "running" records with a stale updatedAt) doesn't re-queue a scan that is
    // still making progress on a large site.
    await query(
      "UPDATE assessment SET log = $log, updatedAt = time::now() WHERE id = type::record($id)",
      { id, log: JSON.stringify(merged) },
    );
  },

  // Overwrite the log in full (no read-modify-write). The worker keeps the full
  // log in memory during a scan and flushes it periodically, so appendLog's
  // read-then-append round-trip is unnecessary.
  async setLog(id: string, entries: LogEntry[]): Promise<void> {
    await query(
      "UPDATE assessment SET log = $log, updatedAt = time::now() WHERE id = type::record($id)",
      { id, log: JSON.stringify(entries.slice(-MAX_LOG_ENTRIES)) },
    );
  },

  // --- Human review workflow ---

  async requestReview(id: string): Promise<boolean> {
    const rows = await query<Record<string, unknown>>(
      "UPDATE assessment SET reviewStatus = 'requested', updatedAt = time::now() WHERE id = type::record($id) AND reviewStatus IS NONE RETURN AFTER",
      { id },
    );
    return rows.length > 0;
  },

  async claimReview(
    id: string,
    claim: { reviewerId: string; reviewerName: string; organization: string; claimedAt: string },
  ): Promise<boolean> {
    const rows = await query<Record<string, unknown>>(
      "UPDATE assessment SET reviewStatus = 'in-review', reviewClaim = $claim, updatedAt = time::now() WHERE id = type::record($id) AND (reviewStatus = 'requested' OR reviewStatus IS NONE) RETURN AFTER",
      { id, claim: JSON.stringify(claim) },
    );
    return rows.length > 0;
  },

  async getReviewState(id: string): Promise<{
    reviewStatus: string | null;
    reviewClaim: string | null;
    conformance: string | null;
    scsMet: number | null;
    scsApplicable: number | null;
  }> {
    const rows = await query<Record<string, unknown>>(
      "SELECT reviewStatus, reviewClaim, conformance, scsMet, scsApplicable FROM assessment WHERE id = type::record($id) LIMIT 1",
      { id },
    );
    const r = rows[0] ?? {};
    return {
      reviewStatus: (r.reviewStatus as string | null) ?? null,
      reviewClaim: (r.reviewClaim as string | null) ?? null,
      conformance: (r.conformance as string | null) ?? null,
      scsMet: r.scsMet == null ? null : Number(r.scsMet),
      scsApplicable: r.scsApplicable == null ? null : Number(r.scsApplicable),
    };
  },

  async listReviewQueue(): Promise<AssessmentSummary[]> {
    const rows = await query<Record<string, unknown>>(
      `SELECT ${SUMMARY_PROJECTION} FROM assessment WHERE reviewStatus = 'requested' OR reviewStatus = 'in-review' ORDER BY updatedAt ASC`,
      {},
    );
    return rows.map(mapSummary);
  },

  async submitReview(
    id: string,
    input: {
      reviewResults: string;
      conformance: string;
      scsMet: number;
      scsApplicable: number;
    },
  ): Promise<void> {
    await query(
      "UPDATE assessment SET reviewStatus = 'reviewed', reviewResults = $reviewResults, conformance = $conformance, scsMet = $scsMet, scsApplicable = $scsApplicable, updatedAt = time::now() WHERE id = type::record($id)",
      { id, ...input },
    );
  },

  // Sum of assessment JSON bytes for an owner. The log field is written
  // separately (bounded to MAX_LOG_ENTRIES) and excluded here.
  async sumBytesByOwner(ownerId: string): Promise<number> {
    const rows = await query<{ total: number | null }>(
      "SELECT math::sum(bytes) AS total FROM assessment WHERE ownerId = $ownerId GROUP ALL",
      { ownerId },
    );
    return rows[0]?.total ?? 0;
  },

  // Cascade delete: assessment + its evidence + its stored PDF. Shared by the
  // owner-gated DELETE route and the retention sweep.
  async deleteAssessmentAndEvidence(id: string): Promise<boolean> {
    await query("DELETE evidence WHERE assessmentId = $id", { id });
    await query("DELETE report_pdf WHERE assessmentId = $id", { id });
    const rows = await query<Record<string, unknown>>(
      "DELETE assessment WHERE id = type::record($id) RETURN BEFORE",
      { id },
    );
    return rows.length > 0;
  },

  // Retention sweep: delete completed/failed assessments (cascade) older than
  // the cutoff, in bounded batches. Returns the deleted assessment ids.
  async deleteExpired(beforeIso: string, limit = 100): Promise<string[]> {
    const ids = await query<string>(
      "SELECT VALUE type::string(id) FROM assessment WHERE status IN ['completed', 'failed'] AND updatedAt < type::datetime($before) LIMIT $limit",
      { before: beforeIso, limit },
    );
    for (const id of ids) {
      await this.deleteAssessmentAndEvidence(id);
    }
    return ids;
  },

  async countFailed24h(): Promise<number> {
    const rows = await query<{ count: number }>(
      "SELECT count() AS count FROM assessment WHERE status = 'failed' AND updatedAt > (time::now() - 24h) GROUP ALL",
      {},
    );
    return rows[0]?.count ?? 0;
  },
};
