import { BRANDING } from "@/lib/branding";

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

export interface ReportComparison {
  lighthouse?: { score: number };
  ibm?: {
    violation: number;
    potentialViolation: number;
    recommendation: number;
    pass: number;
    manual: number;
  };
  conformance?: {
    total: number;
    passed: number;
    failed: number;
    notApplicable: number;
    needsReview: number;
    coverage: number;
    levelAttained: string;
  };
}

export interface ReportData {
  url: string;
  standard: string;
  score: number;
  passBand: string;
  pagesScanned: number;
  findings: ReportFinding[];
  generatedAt?: string;
  comparison?: ReportComparison;
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

function generatedDate(report: ReportData): string {
  const value = report.generatedAt ?? new Date().toISOString();
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toUTCString();
}

export function buildReportHtml(report: ReportData, logoUrl?: string): string {
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

  const conformance = report.comparison?.conformance;
  const conformanceBlock = conformance
    ? `<section class="block">
      <h2>WCAG conformance</h2>
      <p>${conformance.passed} pass · ${conformance.failed} fail · ${conformance.notApplicable} not applicable · ${conformance.needsReview} need review · ${conformance.coverage}% machine-tested · level attained: <strong>${escapeHtml(conformance.levelAttained)}</strong></p>
    </section>`
    : "";

  const comparison = report.comparison;
  const comparisonRows = [
    `<tr><td>Ascent Accessibility</td><td>${report.score}/100</td></tr>`,
    comparison?.lighthouse !== undefined
      ? `<tr><td>Lighthouse (comparable)</td><td>${comparison.lighthouse.score}/100</td></tr>`
      : "",
    comparison?.ibm
      ? `<tr><td>IBM Equal Access</td><td>${comparison.ibm.violation} violations · ${comparison.ibm.potentialViolation} needs review · ${comparison.ibm.recommendation} recommendations</td></tr>`
      : "",
  ].join("");

  const comparisonBlock = comparisonRows
    ? `<section class="block">
      <h2>Cross-tool comparison</h2>
      <table class="compact">
        <thead><tr><th>Tool</th><th>Result</th></tr></thead>
        <tbody>${comparisonRows}</tbody>
      </table>
    </section>`
    : "";

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Accessibility Assessment — ${escapeHtml(report.url)}</title>
<style>
  body { font-family: Arial, sans-serif; margin: 0; color: #111; }
  .letterhead { display: flex; align-items: center; gap: 1rem; border-bottom: 2px solid #111; padding: 1rem 2rem; }
  .letterhead img { height: 3rem; }
  .letterhead .org { font-size: 1.3rem; font-weight: bold; }
  .letterhead .sub { font-size: 0.85rem; color: #555; }
  .content { padding: 1.25rem 2rem; }
  h1 { font-size: 1.5rem; }
  h2 { font-size: 1.1rem; margin: 1.25rem 0 0.25rem; }
  .score { font-size: 3rem; font-weight: bold; }
  .block { margin-top: 1rem; }
  .meta { color: #333; }
  table { border-collapse: collapse; width: 100%; margin-top: 0.5rem; }
  th, td { border: 1px solid #ccc; padding: 0.5rem; text-align: left; vertical-align: top; }
  th { background: #f4f4f4; }
  table.compact td, table.compact th { padding: 0.35rem 0.5rem; }
  .footer { border-top: 2px solid #111; padding: 1rem 2rem; font-size: 0.75rem; color: #555; display: flex; justify-content: space-between; gap: 1rem; }
</style>
</head>
<body>
  <header class="letterhead">
    <img src="${escapeHtml(logoUrl ?? BRANDING.logoUrl)}" alt="Ascent Partners Foundation">
    <div>
      <div class="org">${escapeHtml(BRANDING.name)}</div>
      <div class="sub">Accessibility Assessment Report</div>
    </div>
  </header>

  <main class="content">
    <h1>Accessibility Assessment</h1>
    <p class="meta"><strong>URL:</strong> ${escapeHtml(report.url)}</p>
    <p class="meta"><strong>Standard:</strong> ${escapeHtml(report.standard)}</p>
    <p class="meta"><strong>Pages scanned:</strong> ${report.pagesScanned}</p>
    <p class="meta"><strong>Generated:</strong> ${escapeHtml(generatedDate(report))}</p>
    <div class="score">${report.score} / 100</div>
    <p><strong>Result:</strong> ${escapeHtml(report.passBand)}</p>
    ${conformanceBlock}
    ${comparisonBlock}
    <section class="block">
      <h2>Findings (${report.findings.length})</h2>
      <table>
        <thead>
          <tr><th>Rule</th><th>Impact</th><th>SC</th><th>SC title</th><th>Sources</th><th>Elements</th><th>Page</th><th>Description</th><th>Recommendation</th></tr>
        </thead>
        <tbody>${findingRows}</tbody>
      </table>
    </section>
    <p class="meta" style="margin-top:1.25rem;font-size:0.8rem;">
      Automated findings are preliminary — full conformance requires manual review.
      Engines: axe-core + Lighthouse-comparable score + IBM Equal Access.
    </p>
  </main>

  <footer class="footer">
    <div>
      ${escapeHtml(BRANDING.legalName)}<br>
      ${escapeHtml(BRANDING.charity)}<br>
      ${BRANDING.address.split("\n").map(escapeHtml).join("<br>")}
    </div>
    <div>
      <a href="${escapeHtml(BRANDING.websiteUrl)}">${escapeHtml(BRANDING.website)}</a><br>
      <a href="mailto:${escapeHtml(BRANDING.email)}">${escapeHtml(BRANDING.email)}</a>
    </div>
  </footer>
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
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ?? "https://wcag-score.ascent.partners";
    const logoUrl = `${siteUrl}${BRANDING.logoUrl}`;
    const body = await renderer.render(buildReportHtml(report, logoUrl));
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
