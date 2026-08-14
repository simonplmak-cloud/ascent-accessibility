export interface MetricsSnapshot {
  scans: number;
  failures: number;
  totalDurationMs: number;
}

export interface Metrics {
  recordScan(durationMs: number, failed: boolean): void;
  snapshot(): MetricsSnapshot;
}

export function createMetrics(): Metrics {
  let scans = 0;
  let failures = 0;
  let totalDurationMs = 0;

  return {
    recordScan(durationMs, failed) {
      scans += 1;
      if (failed) failures += 1;
      totalDurationMs += durationMs;
    },
    snapshot() {
      return { scans, failures, totalDurationMs };
    },
  };
}
