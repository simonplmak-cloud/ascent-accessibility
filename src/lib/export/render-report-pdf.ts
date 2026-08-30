import { reportPdfRepository } from "@/db/repository";
import { BRANDING } from "@/lib/site/branding";
import { getSiteUrl } from "@/lib/site/site-url";
import { renderReportDocument } from "./report-document";
import { loadReportStrings } from "./i18n";
import { loadReportData } from "./load-report";

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

/**
 * Render the PDF for a completed assessment and store it in report_pdf. Called
 * best-effort by the worker after the audit backfill; a failure is caught by the
 * caller and never fails the assessment (the export route falls back to on-demand).
 */
export async function renderAndStoreReportPdf(assessmentId: string): Promise<void> {
  const { assessment, report } = await loadReportData(assessmentId);
  const strings = await loadReportStrings(report.locale);
  const logo = await fetchLogo();
  const pdf = await renderReportDocument(report, logo, strings);
  const pdfBase64 = pdf.toString("base64");
  await reportPdfRepository.upsert({
    assessmentId,
    ownerId: assessment.ownerId,
    pdf: pdfBase64,
    bytes: Buffer.byteLength(pdfBase64),
  });
}
