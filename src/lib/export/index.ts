import { BRANDING } from "@/lib/site/branding";
import { getSiteUrl } from "@/lib/site/site-url";
import { renderReportDocument } from "./report-document";
import { loadReportStrings } from "./i18n";
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
  outcomeColor,
  severityCounts,
  severityRank,
  groupFindingsBySeverity,
  topIssues,
  affectedSuccessCriteria,
} from "./report-data";
export type { SeverityCounts, SeverityGroup, AffectedSc } from "./report-data";

async function fetchLogo(): Promise<Buffer | null> {
  try {
    const res = await fetch(`${getSiteUrl()}${BRANDING.logoUrl}`, {
      signal: AbortSignal.timeout(5000),
    });
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
    const strings = await loadReportStrings(report.locale);
    return renderReportDocument(report, logo, strings);
  },
};
