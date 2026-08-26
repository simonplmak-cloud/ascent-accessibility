import { query } from "../index";
import type { NewReportPdf, ReportPdf } from "../schema";

type RawRecord = Record<string, unknown>;

function mapReportPdf(raw: RawRecord): ReportPdf {
  return {
    id: String(raw.id),
    assessmentId: String(raw.assessmentId),
    ownerId: (raw.ownerId as string | null) ?? null,
    pdf: String(raw.pdf ?? ""),
    bytes: raw.bytes == null ? 0 : Number(raw.bytes),
    createdAt: String(raw.createdAt),
  };
}

export const reportPdfRepository = {
  async create(input: NewReportPdf): Promise<ReportPdf> {
    const rows = await query<RawRecord>("CREATE report_pdf CONTENT $data", { data: input });
    return mapReportPdf(rows[0]!);
  },

  /** Upsert: at most one stored PDF per assessment. */
  async upsert(input: NewReportPdf): Promise<void> {
    await query(
      "DELETE report_pdf WHERE assessmentId = $assessmentId; CREATE report_pdf CONTENT $data",
      { assessmentId: input.assessmentId, data: input },
    );
  },

  async findByAssessment(assessmentId: string): Promise<ReportPdf | undefined> {
    const rows = await query<RawRecord>(
      "SELECT * FROM report_pdf WHERE assessmentId = $assessmentId LIMIT 1",
      { assessmentId },
    );
    return rows[0] ? mapReportPdf(rows[0]) : undefined;
  },

  async deleteByAssessment(assessmentId: string): Promise<number> {
    const rows = await query<RawRecord>(
      "DELETE report_pdf WHERE assessmentId = $assessmentId RETURN BEFORE",
      { assessmentId },
    );
    return rows.length;
  },

  async sumBytesByOwner(ownerId: string): Promise<number> {
    const rows = await query<{ total: number | null }>(
      "SELECT math::sum(bytes) AS total FROM report_pdf WHERE ownerId = $ownerId GROUP ALL",
      { ownerId },
    );
    return rows[0]?.total ?? 0;
  },
};
