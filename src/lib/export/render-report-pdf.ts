import { reportPdfRepository } from "@/db/repository";
import { BRANDING } from "@/lib/site/branding";
import { getSiteUrl } from "@/lib/site/site-url";
import { renderReportDocument } from "./report-document";
import { loadReportStrings } from "./i18n";
import { loadReportData } from "./load-report";
import type { ReportData } from "./types";
import sharp from "sharp";

// PDF-embedded evidence is downscaled harder than on-screen evidence: a large
// crawl can otherwise produce a multi-MB PDF that exceeds the SurrealDB blob
// limit. Worker-only — sharp is not available on Vercel (the on-demand fallback
// embeds the stored images as-is).
const PDF_EVIDENCE_MAX_DIMENSION_PX = 900;
const PDF_EVIDENCE_JPEG_QUALITY = 55;

async function downscalePdfEvidence(report: ReportData): Promise<void> {
  const images = report.evidenceImages;
  if (!images) return;
  for (const key of Object.keys(images)) {
    const img = images[key];
    if (!img || !img.dataUri.startsWith("data:image/")) continue;
    try {
      const base64 = img.dataUri.slice(img.dataUri.indexOf(",") + 1);
      const buffer = Buffer.from(base64, "base64");
      const out = await sharp(buffer, { limitInputPixels: 40_000_000 })
        .resize({
          width: PDF_EVIDENCE_MAX_DIMENSION_PX,
          height: PDF_EVIDENCE_MAX_DIMENSION_PX,
          fit: "inside",
          withoutEnlargement: true,
        })
        .jpeg({ quality: PDF_EVIDENCE_JPEG_QUALITY })
        .toBuffer();
      images[key] = {
        mime: "image/jpeg",
        dataUri: `data:image/jpeg;base64,${out.toString("base64")}`,
      };
    } catch {
      /* keep the original image on failure */
    }
  }
}

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

// A pathological report (huge evidence image, adversarial layout) can make
// react-pdf spin forever. Bound the render so a single bad report never blocks
// the worker queue or the backfill loop.
const RENDER_TIMEOUT_MS = 60_000;

function withTimeout<T>(op: () => Promise<T>, label: string, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
    op().then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

/**
 * Render the PDF for a completed assessment and store it in report_pdf. Called
 * best-effort by the worker after the audit backfill; a failure is caught by the
 * caller and never fails the assessment (the export route falls back to on-demand).
 */
export async function renderAndStoreReportPdf(assessmentId: string): Promise<void> {
  await withTimeout(
    async () => {
      const { assessment, report } = await loadReportData(assessmentId);
      await downscalePdfEvidence(report);
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
    },
    `PDF render for ${assessmentId}`,
    RENDER_TIMEOUT_MS,
  );
}
