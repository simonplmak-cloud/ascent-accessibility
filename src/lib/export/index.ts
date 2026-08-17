import { BRANDING } from "@/lib/branding";
import { renderReportDocument } from "./report-document";
import type { ExportFormat, ExportResult, PdfRenderer, ReportData } from "./types";

export type {
  ExportFormat,
  ReportFinding,
  ReportComparison,
  ReportData,
  ExportResult,
  PdfRenderer,
} from "./types";

export {
  SEVERITY_ORDER,
  severityColor,
  passBandColor,
  severityCounts,
  severityRank,
  groupFindingsBySeverity,
  topIssues,
  affectedSuccessCriteria,
} from "./report-data";
export type { SeverityCounts, SeverityGroup, AffectedSc } from "./report-data";

async function fetchLogo(): Promise<Buffer | null> {
  try {
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ?? "https://wcag-score.ascent.partners";
    const res = await fetch(`${siteUrl}${BRANDING.logoUrl}`);
    if (!res.ok) return null;
    return Buffer.from(await res.arrayBuffer());
  } catch {
    return null;
  }
}

export async function exportReport(
  report: ReportData,
  format: ExportFormat,
  pdfRenderer?: PdfRenderer,
): Promise<ExportResult> {
  if (format === "pdf") {
    const renderer = pdfRenderer ?? defaultPdfRenderer;
    const body = await renderer.render(report);
    return { contentType: "application/pdf", body };
  }
  throw new Error(`Unsupported export format: ${format}`);
}

const defaultPdfRenderer: PdfRenderer = {
  async render(report) {
    const logo = await fetchLogo();
    return renderReportDocument(report, logo);
  },
};
