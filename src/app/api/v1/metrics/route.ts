import { NextResponse } from "next/server";
import { metricsRepository } from "@/db/repository";

export const dynamic = "force-dynamic";

function metric(
  name: string,
  help: string,
  type: "gauge" | "counter",
  value: number | null | undefined,
): string {
  if (value == null) return "";
  return `# HELP ${name} ${help}\n# TYPE ${name} ${type}\n${name} ${value}`;
}

// Prometheus text exposition format. Scraped by the Prometheus instance defined
// in deploy/swas/prometheus (docker compose) against the worker box.
export async function GET() {
  const m = await metricsRepository.read();
  const body = [
    metric("wcag_scan_storage_bytes", "Storage bytes used by assessments, evidence, and PDFs.", "gauge", m?.storageBytes),
    metric("wcag_scan_queue_depth", "Assessments currently queued.", "gauge", m?.queueDepth),
    metric("wcag_scan_failed_scans_24h", "Assessments failed in the last 24 hours.", "gauge", m?.failedScans24h),
    metric("wcag_scan_count", "Scans recorded since worker start.", "counter", m?.scans),
    metric("wcag_scan_failures", "Scan failures since worker start.", "counter", m?.failures),
    metric("wcag_scan_duration_p50_ms", "Scan duration p50 (ms).", "gauge", m?.p50),
    metric("wcag_scan_duration_p95_ms", "Scan duration p95 (ms).", "gauge", m?.p95),
    metric("wcag_scan_duration_p99_ms", "Scan duration p99 (ms).", "gauge", m?.p99),
  ]
    .filter(Boolean)
    .join("\n");

  return new NextResponse(body ? `${body}\n` : "", {
    headers: { "Content-Type": "text/plain; version=0.0.4; charset=utf-8" },
  });
}
