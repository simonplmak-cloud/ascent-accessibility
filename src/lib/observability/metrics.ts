export interface MetricsSnapshot {
  scans: number;
  failures: number;
  totalDurationMs: number;
  p50: number | null;
  p95: number | null;
  p99: number | null;
}

export interface Metrics {
  recordScan(durationMs: number, failed: boolean): void;
  snapshot(): MetricsSnapshot;
}

const MAX_SAMPLES = 1000;

function percentile(sorted: number[], p: number): number | null {
  if (sorted.length === 0) return null;
  const idx = Math.min(sorted.length - 1, Math.floor(sorted.length * p));
  return sorted[idx]!;
}

export function createMetrics(): Metrics {
  let scans = 0;
  let failures = 0;
  let totalDurationMs = 0;
  const durations: number[] = [];

  return {
    recordScan(durationMs, failed) {
      scans += 1;
      if (failed) failures += 1;
      totalDurationMs += durationMs;
      durations.push(durationMs);
      if (durations.length > MAX_SAMPLES) durations.shift();
    },
    snapshot() {
      const sorted = [...durations].sort((a, b) => a - b);
      return {
        scans,
        failures,
        totalDurationMs,
        p50: percentile(sorted, 0.5),
        p95: percentile(sorted, 0.95),
        p99: percentile(sorted, 0.99),
      };
    },
  };
}
