import { describe, expect, it } from "vitest";
import { createMetrics } from "@/lib/observability/metrics";
import { logger, withCorrelationId } from "@/lib/observability/logger";

describe("createMetrics (AC-15)", () => {
  it("tracks scan counts, failures, and total duration", () => {
    const metrics = createMetrics();
    metrics.recordScan(120, false);
    metrics.recordScan(300, true);
    metrics.recordScan(80, false);
    expect(metrics.snapshot()).toEqual({
      scans: 3,
      failures: 1,
      totalDurationMs: 500,
    });
  });

  it("starts empty", () => {
    expect(createMetrics().snapshot()).toEqual({
      scans: 0,
      failures: 0,
      totalDurationMs: 0,
    });
  });
});

describe("logger (AC-15)", () => {
  it("exposes a logger and correlation-id child logger", () => {
    expect(typeof logger.info).toBe("function");
    const child = withCorrelationId("abc-123");
    expect(typeof child.info).toBe("function");
  });
});
