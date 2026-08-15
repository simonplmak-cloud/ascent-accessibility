export type ExportFormat = "pdf" | "csv";

export interface ReportFinding {
  ruleId: string;
  impact: string;
  description: string;
  pageUrl: string;
  elementCount: number;
  recommendation: string;
  wcagSc?: string[];
  scTitle?: string;
  confidence?: string;
  sources?: string[];
}

export interface ReportData {
  url: string;
  standard: string;
  score: number;
  passBand: string;
  pagesScanned: number;
  findings: ReportFinding[];
}

export interface ExportResult {
  contentType: string;
  body: Buffer;
}

export interface PdfRenderer {
  render(html: string): Promise<Buffer>;
}

const CSV_HEADER = [
  "ruleId",
  "impact",
  "wcagSc",
  "scTitle",
  "sources",
  "confidence",
  "pageUrl",
  "elementCount",
  "description",
  "recommendation",
];

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

export function buildCsv(report: ReportData): string {
  const rows = report.findings.map((finding) => [
    finding.ruleId,
    finding.impact,
    (finding.wcagSc ?? []).join(" "),
    finding.scTitle ?? "",
    (finding.sources ?? []).join(" "),
    finding.confidence ?? "",
    finding.pageUrl,
    String(finding.elementCount),
    finding.description,
    finding.recommendation,
  ]);
  const lines = [CSV_HEADER, ...rows].map((row) => row.map(csvEscape).join(","));
  return `${lines.join("\n")}\n`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function buildReportHtml(report: ReportData): string {
  const findingRows = report.findings
    .map(
      (f) => `<tr>
        <td>${escapeHtml(f.ruleId)}</td>
        <td>${escapeHtml(f.impact)}</td>
        <td>${escapeHtml((f.wcagSc ?? []).join(" "))}</td>
        <td>${escapeHtml(f.scTitle ?? "")}</td>
        <td>${escapeHtml((f.sources ?? []).join(", "))}</td>
        <td>${f.elementCount}</td>
        <td>${escapeHtml(f.pageUrl)}</td>
        <td>${escapeHtml(f.description)}</td>
        <td>${escapeHtml(f.recommendation)}</td>
      </tr>`,
    )
    .join("");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Accessibility Assessment — ${escapeHtml(report.url)}</title>
<style>
  body { font-family: Arial, sans-serif; margin: 2rem; color: #111; }
  h1 { font-size: 1.5rem; }
  .score { font-size: 3rem; font-weight: bold; }
  table { border-collapse: collapse; width: 100%; margin-top: 1rem; }
  th, td { border: 1px solid #ccc; padding: 0.5rem; text-align: left; vertical-align: top; }
  th { background: #f4f4f4; }
</style>
</head>
<body>
  <h1>Accessibility Assessment</h1>
  <p><strong>URL:</strong> ${escapeHtml(report.url)}</p>
  <p><strong>Standard:</strong> ${escapeHtml(report.standard)}</p>
  <p><strong>Pages scanned:</strong> ${report.pagesScanned}</p>
  <div class="score">${report.score} / 100</div>
  <p><strong>Result:</strong> ${escapeHtml(report.passBand)}</p>
  <table>
    <thead>
      <tr><th>Rule</th><th>Impact</th><th>SC</th><th>SC title</th><th>Sources</th><th>Elements</th><th>Page</th><th>Description</th><th>Recommendation</th></tr>
    </thead>
    <tbody>${findingRows}</tbody>
  </table>
</body>
</html>`;
}

export async function exportReport(
  report: ReportData,
  format: ExportFormat,
  pdfRenderer?: PdfRenderer,
): Promise<ExportResult> {
  if (format === "csv") {
    return { contentType: "text/csv", body: Buffer.from(buildCsv(report)) };
  }
  if (format === "pdf") {
    const renderer = pdfRenderer ?? defaultPdfRenderer;
    const body = await renderer.render(buildReportHtml(report));
    return { contentType: "application/pdf", body };
  }
  throw new Error(`Unsupported export format: ${format}`);
}

const defaultPdfRenderer: PdfRenderer = {
  async render(html) {
    const { chromium } = await import("playwright");
    const token = process.env.BROWSERLESS_TOKEN;
    const browser = token
      ? await chromium.connectOverCDP(
          `${process.env.BROWSERLESS_URL ?? "wss://chrome.browserless.io"}?token=${token}`,
        )
      : await chromium.launch();
    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: "networkidle" });
      return await page.pdf({ format: "A4" });
    } finally {
      await browser.close();
    }
  },
};
