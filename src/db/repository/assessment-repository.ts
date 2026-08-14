import { query } from "../index";
import type { Assessment, Finding, NewAssessment } from "../schema";

export interface CompleteAssessmentInput {
  score: number;
  passBand: "pass" | "partial" | "fail";
  pagesScanned: number;
  partial: boolean;
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
      findings,
    });
  },

  async findFindings(id: string): Promise<Finding[]> {
    const rows = await query<{ findings: Finding[] }>(
      "SELECT findings FROM assessment WHERE id = type::record($id) LIMIT 1",
      { id },
    );
    return rows[0]?.findings ?? [];
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
};
