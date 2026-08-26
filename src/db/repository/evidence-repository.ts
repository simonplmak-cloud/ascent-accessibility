import { RecordId } from "surrealdb";
import { query } from "../index";
import type { Evidence, NewEvidence } from "../schema";

type RawRecord = Record<string, unknown>;

function mapEvidence(raw: RawRecord): Evidence {
  return {
    id: String(raw.id),
    assessmentId: String(raw.assessmentId),
    ownerId: (raw.ownerId as string | null) ?? null,
    pageUrl: String(raw.pageUrl),
    kind: raw.kind as Evidence["kind"],
    image: String(raw.image ?? ""),
    mime: String(raw.mime),
    html: (raw.html as string | null) ?? null,
    bytes: raw.bytes == null ? 0 : Number(raw.bytes),
    compacted: Boolean(raw.compacted),
    createdAt: String(raw.createdAt),
  };
}

/** Byte size of a piece of evidence: base64 image length + HTML byte length. */
export function evidenceBytes(image: string, html?: string | null): number {
  return Buffer.byteLength(image) + (html ? Buffer.byteLength(html) : 0);
}

export const evidenceRepository = {
  async create(input: NewEvidence): Promise<Evidence> {
    const data = {
      ...input,
      bytes: evidenceBytes(input.image, input.html),
      compacted: false,
    };
    const rows = await query<RawRecord>("CREATE evidence CONTENT $data", { data });
    return mapEvidence(rows[0]!);
  },

  async findById(id: string): Promise<Evidence | undefined> {
    const rows = await query<RawRecord>(
      "SELECT * FROM evidence WHERE id = type::record($id) LIMIT 1",
      { id },
    );
    return rows[0] ? mapEvidence(rows[0]) : undefined;
  },

  async listByIds(ids: string[]): Promise<Evidence[]> {
    if (ids.length === 0) return [];
    const recordIds = ids.map((id) => new RecordId("evidence", id.replace(/^evidence:/, "")));
    const rows = await query<RawRecord>("SELECT * FROM evidence WHERE id IN $ids", {
      ids: recordIds,
    });
    return rows.map(mapEvidence);
  },

  async listByAssessment(assessmentId: string): Promise<Evidence[]> {
    const rows = await query<RawRecord>(
      "SELECT * FROM evidence WHERE assessmentId = $assessmentId ORDER BY createdAt ASC",
      { assessmentId },
    );
    return rows.map(mapEvidence);
  },

  async deleteByAssessment(assessmentId: string): Promise<number> {
    const rows = await query<RawRecord>(
      "DELETE evidence WHERE assessmentId = $assessmentId RETURN BEFORE",
      { assessmentId },
    );
    return rows.length;
  },

  /** Sum of evidence bytes for an owner (indexed by ownerId). */
  async sumBytesByOwner(ownerId: string): Promise<number> {
    const rows = await query<{ total: number | null }>(
      "SELECT math::sum(bytes) AS total FROM evidence WHERE ownerId = $ownerId GROUP ALL",
      { ownerId },
    );
    return rows[0]?.total ?? 0;
  },
};
