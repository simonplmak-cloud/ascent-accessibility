import { query } from "../index";
import type { Assessment, Finding, LogEntry, NewAssessment, PassBand } from "../schema";

export interface CompleteAssessmentInput {
  score: number;
  passBand: "pass" | "partial" | "fail";
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
  pagesScanned: number;
  partial: boolean;
  createdAt: string;
  updatedAt: string;
}

const SUMMARY_PROJECTION =
  "id, url, standard, status, score, passBand, pagesScanned, partial, createdAt, updatedAt";

function mapSummary(raw: Record<string, unknown>): AssessmentSummary {
  return {
    id: String(raw.id),
    url: String(raw.url),
    standard: String(raw.standard),
    status: raw.status as Assessment["status"],
    score: raw.score == null ? null : Number(raw.score),
    passBand: (raw.passBand as PassBand | null) ?? null,
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
      "UPDATE assessment SET status = 'completed', score = $score, passBand = $passBand, pagesScanned = $pagesScanned, partial = $partial, updatedAt = time::now() WHERE id = type::record($id)",
      { id, ...input },
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

  async list(limit = 500): Promise<AssessmentSummary[]> {
    const rows = await query<Record<string, unknown>>(
      `SELECT ${SUMMARY_PROJECTION} FROM assessment ORDER BY createdAt DESC LIMIT $limit`,
      { limit },
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
    await query("UPDATE assessment SET log = $log WHERE id = type::record($id)", {
      id,
      log: JSON.stringify(merged),
    });
  },
};
