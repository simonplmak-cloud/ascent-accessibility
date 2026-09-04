import { query } from "../index";
import type { MetricsRecord } from "../schema";

type RawRecord = Record<string, unknown>;

export const METRICS_ID = "metrics:latest";

function map(raw: RawRecord): MetricsRecord {
  const optNum = (v: unknown): number | null => (v == null ? null : Number(v));
  return {
    storageBytes: raw.storageBytes == null ? 0 : Number(raw.storageBytes),
    queueDepth: raw.queueDepth == null ? 0 : Number(raw.queueDepth),
    failedScans24h: raw.failedScans24h == null ? 0 : Number(raw.failedScans24h),
    scans: raw.scans == null ? 0 : Number(raw.scans),
    failures: raw.failures == null ? 0 : Number(raw.failures),
    p50: optNum(raw.p50),
    p95: optNum(raw.p95),
    p99: optNum(raw.p99),
    updatedAt: String(raw.updatedAt ?? ""),
  };
}

export const metricsRepository = {
  async upsert(record: Omit<MetricsRecord, "updatedAt">): Promise<void> {
    // SCHEMAFULL `option<int>` rejects SQL NULL (it wants NONE), so omit the
    // latency fields entirely when they are unset rather than sending null.
    const fields = [
      `storageBytes: ${record.storageBytes}`,
      `queueDepth: ${record.queueDepth}`,
      `failedScans24h: ${record.failedScans24h}`,
      `scans: ${record.scans}`,
      `failures: ${record.failures}`,
    ];
    if (record.p50 != null) fields.push(`p50: ${record.p50}`);
    if (record.p95 != null) fields.push(`p95: ${record.p95}`);
    if (record.p99 != null) fields.push(`p99: ${record.p99}`);
    fields.push("updatedAt: time::now()");
    await query(`UPSERT ${METRICS_ID} CONTENT { ${fields.join(", ")} }`);
  },

  async read(): Promise<MetricsRecord | undefined> {
    const rows = await query<RawRecord>(
      "SELECT storageBytes, queueDepth, failedScans24h, scans, failures, p50, p95, p99, updatedAt FROM metrics WHERE id = type::record($id) LIMIT 1",
      { id: METRICS_ID },
    );
    return rows[0] ? map(rows[0]) : undefined;
  },
};
