import { getDb, query, withDbRetry } from "../index";
import type { Assessment, Finding, LogEntry, NewAssessment, PassBand } from "../schema";

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
  status: Assessment["status"];
  score: number | null;
  passBand: PassBand | null;
  conformance: string | null;
  scsMet: number | null;
  scsApplicable: number | null;
  pagesScanned: number;
  partial: boolean;
  createdAt: string;
  updatedAt: string;
}

const SUMMARY_PROJECTION =
  "id, url, standard, status, score, passBand, conformance, scsMet, scsApplicable, pagesScanned, partial, createdAt, updatedAt";

function mapSummary(raw: Record<string, unknown>): AssessmentSummary {
  return {
    id: String(raw.id),
    url: String(raw.url),
    standard: String(raw.standard),
    status: raw.status as Assessment["status"],
    score: raw.score == null ? null : Number(raw.score),
    passBand: (raw.passBand as PassBand | null) ?? null,
    conformance: (raw.conformance as string | null) ?? null,
    scsMet: raw.scsMet == null ? null : Number(raw.scsMet),
    scsApplicable: raw.scsApplicable == null ? null : Number(raw.scsApplicable),
    pagesScanned: Number(raw.pagesScanned ?? 0),
    partial: Boolean(raw.partial),
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
    input: CompleteAssessmentInput & { findings: Finding[]; comparison: unknown },
  ): Promise<void> {
    await query(
      "UPDATE assessment SET status = 'completed', conformance = $conformance, scsMet = $scsMet, scsApplicable = $scsApplicable, pagesScanned = $pagesScanned, partial = $partial, findings = $findings, comparison = $comparison, updatedAt = time::now() WHERE id = type::record($id)",
      {
        id,
        conformance: input.conformance,
        scsMet: input.scsMet,
        scsApplicable: input.scsApplicable,
        pagesScanned: input.pagesScanned,
        partial: input.partial,
        findings: JSON.stringify(input.findings),
        comparison: JSON.stringify(input.comparison),
      },
    );
  },

  async fail(id: string): Promise<void> {
    await query(
      "UPDATE assessment SET status = 'failed', updatedAt = time::now() WHERE id = type::record($id)",
      { id },
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
};
