import { BRANDING } from "@/lib/branding";
import {
  passBandColor,
  scoreGauge,
  severityBarChart,
  severityColor,
  severityCounts,
  severityRank,
  SEVERITY_ORDER,
  conformanceBarChart,
} from "@/lib/export/charts";

export type ExportFormat = "pdf";

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

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function buildReportHtml(report: ReportData, logoUrl?: string): string {
  const conformance = report.comparison?.conformance;
  const comparison = report.comparison;
  const counts = severityCounts(report.findings);
  const bandColor = passBandColor(report.passBand);
  const totalFindings = report.findings.length;

  // Findings grouped by severity (highest first).
  const grouped = SEVERITY_ORDER.map((sev) => ({
    sev,
    items: report.findings.filter((f) => f.impact === sev),
  })).filter((g) => g.items.length > 0);

  // Top issues: highest severity first, capped at 5.
  const topIssues = [...report.findings]
    .sort((a, b) => severityRank(a.impact) - severityRank(b.impact))
    .slice(0, 5);

  // Affected success criteria, derived from findings (highest severity wins).
  const scMap = new Map<string, { title: string; sev: string; elements: number }>();
  for (const finding of report.findings) {
    for (const sc of finding.wcagSc ?? []) {
      const existing = scMap.get(sc);
      if (existing) {
        existing.elements += finding.elementCount;
        if (severityRank(finding.impact) < severityRank(existing.sev)) existing.sev = finding.impact;
      } else {
        scMap.set(sc, {
          title: finding.scTitle ?? "",
          sev: finding.impact,
          elements: finding.elementCount,
        });
      }
    }
  }
  const scRows = [...scMap.entries()]
    .map(([sc, v]) => ({ sc, ...v }))
    .sort((a, b) => a.sc.localeCompare(b.sc));

  const cover = `<header class="cover">
    <img src="${escapeHtml(logoUrl ?? BRANDING.logoUrl)}" alt="Ascent Partners Foundation">
    <div class="org">${escapeHtml(BRANDING.name)}</div>
    <div class="sub">${escapeHtml(BRANDING.tagline)}</div>
    <h1 class="cover-title">Web Accessibility Assessment Report</h1>
    <table class="meta">
      <tr><th>URL</th><td>${escapeHtml(report.url)}</td></tr>
      <tr><th>Standard</th><td>${escapeHtml(report.standard)}</td></tr>
      <tr><th>Pages scanned</th><td>${report.pagesScanned}</td></tr>
      <tr><th>Generated</th><td>${escapeHtml(generatedDate(report))}</td></tr>
    </table>
    <div class="gauge">${scoreGauge(report.score, bandColor)}</div>
    <div class="verdict" style="color:${bandColor}">Result: ${escapeHtml(report.passBand)}</div>
    <p class="disclaimer">Automated assessment — findings are preliminary and do not constitute a full WCAG conformance claim.</p>
  </header>
  <div class="page-break"></div>`;

  const tocItems = [
    { href: "#executive-summary", label: "Executive summary" },
    { href: "#methodology", label: "Methodology" },
    { href: "#conformance", label: "WCAG conformance" },
    { href: "#severity", label: "Severity distribution" },
    { href: "#findings", label: "Findings" },
    { href: "#recommendations", label: "Remediation recommendations" },
    ...(comparison ? [{ href: "#comparison", label: "Cross-tool comparison" }] : []),
  ];
  const toc = `<nav class="toc" aria-label="Table of contents">
    <h2>Table of contents</h2>
    <ol>${tocItems.map((t) => `<li><a href="${t.href}">${t.label}</a></li>`).join("")}</ol>
  </nav>
  <div class="page-break"></div>`;

  const execSummary = `<section id="executive-summary">
    <h2>1. Executive summary</h2>
    <p>Result: <strong style="color:${bandColor}">${escapeHtml(report.passBand)}</strong> — score ${report.score} / 100 across ${report.pagesScanned} page(s).</p>
    <p>${totalFindings} finding(s): <strong>critical</strong> ${counts.critical}, <strong>serious</strong> ${counts.serious}, <strong>moderate</strong> ${counts.moderate}, <strong>minor</strong> ${counts.minor}.</p>
    ${
      topIssues.length
        ? `<h3>Top issues</h3><ol>${topIssues
            .map(
              (f) =>
                `<li><span class="sev-tag" style="background:${severityColor(f.impact)}">${escapeHtml(f.impact)}</span> ${escapeHtml(f.description)}</li>`,
            )
            .join("")}</ol>`
        : `<p class="chart-empty">No automated findings detected.</p>`
    }
  </section>`;

  const methodology = `<section id="methodology">
    <h2>2. Methodology</h2>
    <p>Automated testing engines: <strong>axe-core</strong>, <strong>IBM Equal Access</strong>, and a <strong>Lighthouse-comparable</strong> score.</p>
    <p>This is an automated baseline. Automated tools detect a subset of WCAG issues; full conformance requires manual review (keyboard operation, screen readers, and contrast inspection).</p>
  </section>`;

  const conformanceSection = `<section id="conformance">
    <h2>3. WCAG conformance</h2>
    ${
      conformance
        ? `<p>${conformance.passed} pass · ${conformance.failed} fail · ${conformance.notApplicable} not applicable · ${conformance.needsReview} need review · ${conformance.coverage}% machine-tested · level attained: <strong>${escapeHtml(conformance.levelAttained)}</strong></p>
        ${conformanceBarChart({ passed: conformance.passed, failed: conformance.failed, notApplicable: conformance.notApplicable, needsReview: conformance.needsReview })}
        ${
          scRows.length
            ? `<h3>Affected success criteria</h3>
            <table>
              <thead><tr><th>WCAG SC</th><th>Title</th><th>Severity</th><th>Elements</th></tr></thead>
              <tbody>${scRows
                .map(
                  (r) =>
                    `<tr><td>${escapeHtml(r.sc)}</td><td>${escapeHtml(r.title)}</td><td><span class="sev-tag" style="background:${severityColor(r.sev)}">${escapeHtml(r.sev)}</span></td><td>${r.elements}</td></tr>`,
                )
                .join("")}</tbody>
            </table>`
            : ""
        }`
        : `<p class="chart-empty">No conformance data available.</p>`
    }
  </section>`;

  const severitySection = `<section id="severity">
    <h2>4. Severity distribution</h2>
    ${severityBarChart(counts)}
  </section>`;

  const findingsSection = `<section id="findings">
    <h2>5. Findings</h2>
    ${
      totalFindings === 0
        ? `<p class="chart-empty">No automated findings detected.</p>`
        : grouped
            .map(
              (g) => `<h3 style="color:${severityColor(g.sev)}">${capitalize(g.sev)} (${g.items.length})</h3>
              <table>
                <thead><tr><th>Rule</th><th>WCAG SC</th><th>Page</th><th>Description</th><th>Recommendation</th></tr></thead>
                <tbody>${g.items
                  .map(
                    (f) => `<tr>
                      <td>${escapeHtml(f.ruleId)}</td>
                      <td>${escapeHtml((f.wcagSc ?? []).join(" "))}</td>
                      <td>${escapeHtml(f.pageUrl)}</td>
                      <td>${escapeHtml(f.description)}</td>
                      <td>${escapeHtml(f.recommendation)}</td>
                    </tr>`,
                  )
                  .join("")}</tbody>
              </table>`,
            )
            .join("")
    }
  </section>`;

  const recommendations = `<section id="recommendations">
    <h2>6. Remediation recommendations</h2>
    ${
      totalFindings === 0
        ? `<p class="chart-empty">No remediation required by this scan.</p>`
        : `<ol>${[...report.findings]
            .sort((a, b) => severityRank(a.impact) - severityRank(b.impact))
            .map(
              (f) =>
                `<li><strong>${escapeHtml((f.wcagSc ?? []).join(" ") || f.ruleId)}</strong> — ${escapeHtml(f.recommendation)} <span class="muted">(${escapeHtml(f.pageUrl)})</span></li>`,
            )
            .join("")}</ol>`
    }
  </section>`;

  const comparisonSection = comparison
    ? `<section id="comparison">
    <h2>7. Cross-tool comparison</h2>
    <table>
      <thead><tr><th>Tool</th><th>Result</th></tr></thead>
      <tbody>
        <tr><td>Ascent Accessibility</td><td>${report.score} / 100</td></tr>
        ${
          comparison.lighthouse !== undefined
            ? `<tr><td>Lighthouse (comparable)</td><td>${comparison.lighthouse.score} / 100</td></tr>`
            : ""
        }
        ${
          comparison.ibm
            ? `<tr><td>IBM Equal Access</td><td>${comparison.ibm.violation} violations · ${comparison.ibm.potentialViolation} needs review · ${comparison.ibm.recommendation} recommendations</td></tr>`
            : ""
        }
      </tbody>
    </table>
  </section>`
    : "";

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Web Accessibility Assessment — ${escapeHtml(report.url)}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: Arial, sans-serif; margin: 0; color: #1f2328; font-size: 13px; line-height: 1.5; }
  .page-break { page-break-after: always; }
  h1, h2, h3 { font-weight: 700; }
  h2 { font-size: 1.25rem; margin: 1.4rem 0 0.4rem; border-bottom: 1px solid #e5e7eb; padding-bottom: 0.25rem; }
  h3 { font-size: 1rem; margin: 1rem 0 0.4rem; }
  table { border-collapse: collapse; width: 100%; margin-top: 0.5rem; }
  th, td { border: 1px solid #d0d7de; padding: 0.4rem 0.5rem; text-align: left; vertical-align: top; }
  th { background: #f6f8fa; }
  .muted { color: #59636e; font-size: 0.85em; }

  .cover { text-align: center; padding: 2rem 1rem; }
  .cover img { height: 3.5rem; }
  .cover .org { font-size: 1.4rem; font-weight: 700; margin-top: 0.75rem; }
  .cover .sub { font-size: 0.9rem; color: #59636e; }
  .cover-title { font-size: 1.7rem; margin: 2rem 0 1rem; }
  .cover .meta { width: 60%; margin: 0 auto; }
  .cover .meta th, .cover .meta td { border: none; text-align: left; padding: 0.25rem 0.5rem; }
  .cover .meta th { background: none; width: 40%; color: #59636e; }
  .gauge { margin: 1.5rem auto 0; max-width: 260px; }
  .verdict { font-size: 1.2rem; font-weight: 700; margin-top: 0.5rem; }
  .disclaimer { color: #59636e; font-size: 0.8rem; max-width: 32rem; margin: 1.25rem auto 0; }

  .toc ol { list-style: none; padding-left: 0; }
  .toc li { padding: 0.35rem 0; border-bottom: 1px solid #f0f0f0; }
  .toc a { color: #0969da; text-decoration: none; font-size: 1.05rem; }

  .sev-tag { color: #ffffff; padding: 0.1rem 0.5rem; border-radius: 0.25rem; font-size: 0.8rem; font-weight: 600; text-transform: uppercase; }
  .chart-legend { margin-top: 0.5rem; font-size: 0.85rem; }
  .chart-legend .legend { display: inline-block; margin-right: 1rem; }
  .chart-legend .swatch { display: inline-block; width: 0.7rem; height: 0.7rem; border-radius: 2px; margin-right: 0.3rem; }
  .chart-empty { color: #59636e; font-style: italic; }

  section { page-break-inside: auto; }
</style>
</head>
<body>
  ${cover}
  ${toc}
  <main>
    ${execSummary}
    ${methodology}
    ${conformanceSection}
    ${severitySection}
    ${findingsSection}
    ${recommendations}
    ${comparisonSection}
  </main>
  <footer class="colophon">
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
      return await page.pdf({
        format: "A4",
        printBackground: true,
        displayHeaderFooter: true,
        headerTemplate: "<div></div>",
        footerTemplate:
          '<div style="font-size:9px;width:100%;text-align:center;color:#59636e;font-family:ui-monospace,Menlo,Consolas,monospace;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>',
        margin: { top: "16mm", bottom: "16mm", left: "14mm", right: "14mm" },
      });
    } finally {
      await browser.close();
    }
  },
};
