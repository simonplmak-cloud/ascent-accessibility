import { query } from "../index";
import type { Evidence, NewEvidence } from "../schema";

type RawRecord = Record<string, unknown>;

function mapEvidence(raw: RawRecord): Evidence {
  return {
    id: String(raw.id),
    assessmentId: String(raw.assessmentId),
    pageUrl: String(raw.pageUrl),
    kind: raw.kind as Evidence["kind"],
    image: String(raw.image ?? ""),
    mime: String(raw.mime),
    createdAt: String(raw.createdAt),
  };
}

export const evidenceRepository = {
  async create(input: NewEvidence): Promise<Evidence> {
    const rows = await query<RawRecord>("CREATE evidence CONTENT $data", { data: input });
    return mapEvidence(rows[0]!);
  },

  async findById(id: string): Promise<Evidence | undefined> {
    const rows = await query<RawRecord>(
      "SELECT * FROM evidence WHERE id = type::record($id) LIMIT 1",
      { id },
    );
    return rows[0] ? mapEvidence(rows[0]) : undefined;
  },

  async listByAssessment(assessmentId: string): Promise<Evidence[]> {
    const rows = await query<RawRecord>(
      "SELECT * FROM evidence WHERE assessmentId = type::record($assessmentId) ORDER BY createdAt ASC",
      { assessmentId },
    );
    return rows.map(mapEvidence);
  },
};
