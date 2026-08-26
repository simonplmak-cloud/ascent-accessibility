import { query } from "../index";
import type { MetricsRecord } from "../schema";

type RawRecord = Record<string, unknown>;

export const METRICS_ID = "metrics:latest";

function map(raw: RawRecord): MetricsRecord {
  return {
    storageBytes: raw.storageBytes == null ? 0 : Number(raw.storageBytes),
    queueDepth: raw.queueDepth == null ? 0 : Number(raw.queueDepth),
    failedScans24h: raw.failedScans24h == null ? 0 : Number(raw.failedScans24h),
    updatedAt: String(raw.updatedAt ?? ""),
  };
}

export const metricsRepository = {
  async upsert(record: Omit<MetricsRecord, "updatedAt">): Promise<void> {
    await query(
      `UPSERT ${METRICS_ID} CONTENT { storageBytes: $storageBytes, queueDepth: $queueDepth, failedScans24h: $failedScans24h, updatedAt: time::now() }`,
      { ...record },
    );
  },

  async read(): Promise<MetricsRecord | undefined> {
    const rows = await query<RawRecord>(
      "SELECT storageBytes, queueDepth, failedScans24h, updatedAt FROM metrics WHERE id = type::record($id) LIMIT 1",
      { id: METRICS_ID },
    );
    return rows[0] ? map(rows[0]) : undefined;
  },
};
