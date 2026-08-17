// Inline-SVG chart builders for the PDF report. Pure functions (data in →
// string out) so they're node-unit-testable and render deterministically in
// headless Chromium — no client-side chart library.

export const SEVERITY_ORDER = ["critical", "serious", "moderate", "minor"] as const;

// Print-safe severity palette (accessible on a white page — GitHub Primer).
export const SEVERITY_COLORS: Record<string, string> = {
  critical: "#d1242f",
  serious: "#bc4c00",
  moderate: "#9a6700",
  minor: "#59636e",
};

export const BAND_COLORS: Record<string, string> = {
  pass: "#1a7f37",
  partial: "#9a6700",
  fail: "#d1242f",
};

export function severityColor(impact: string): string {
  return SEVERITY_COLORS[impact] ?? "#59636e";
}

export function passBandColor(passBand: string): string {
  return BAND_COLORS[passBand] ?? "#59636e";
}

export function severityRank(impact: string): number {
  const index = SEVERITY_ORDER.indexOf(impact as (typeof SEVERITY_ORDER)[number]);
  return index === -1 ? SEVERITY_ORDER.length : index;
}

export interface SeverityCounts {
  critical: number;
  serious: number;
  moderate: number;
  minor: number;
}

export function severityCounts(findings: { impact: string }[]): SeverityCounts {
  const counts: SeverityCounts = { critical: 0, serious: 0, moderate: 0, minor: 0 };
  for (const finding of findings) {
    const key = finding.impact in counts ? finding.impact : "minor";
    counts[key as keyof SeverityCounts] += 1;
  }
  return counts;
}

/** Semi-circular 0-100 gauge, colour-coded by the pass band. */
export function scoreGauge(score: number, color: string): string {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const radius = 80;
  const arcLength = Math.PI * radius;
  const dash = arcLength * (clamped / 100);

  return `<svg viewBox="0 0 200 130" width="240" role="img" aria-label="Accessibility score ${clamped} out of 100">
  <title>Accessibility score ${clamped} out of 100</title>
  <path d="M 20 110 A ${radius} ${radius} 0 0 1 180 110" fill="none" stroke="#e5e7eb" stroke-width="16" stroke-linecap="round"/>
  <path d="M 20 110 A ${radius} ${radius} 0 0 1 180 110" fill="none" stroke="${color}" stroke-width="16" stroke-linecap="round" stroke-dasharray="${dash.toFixed(1)} ${arcLength.toFixed(1)}"/>
  <text x="100" y="100" text-anchor="middle" font-family="ui-monospace, Menlo, Consolas, monospace" font-size="44" font-weight="bold" fill="${color}">${clamped}</text>
  <text x="100" y="122" text-anchor="middle" font-family="ui-monospace, Menlo, Consolas, monospace" font-size="13" fill="#59636e">out of 100</text>
</svg>`;
}

/** Horizontal bar chart of findings by severity. */
export function severityBarChart(counts: SeverityCounts): string {
  const max = Math.max(1, ...SEVERITY_ORDER.map((s) => counts[s]));
  const barMaxWidth = 260;
  const rowHeight = 30;
  const height = SEVERITY_ORDER.length * rowHeight;

  const rows = SEVERITY_ORDER.map((sev, i) => {
    const count = counts[sev];
    const width = count === 0 ? 0 : Math.max(6, (count / max) * barMaxWidth);
    const textY = i * rowHeight + 21;
    const barY = i * rowHeight + 8;
    const color = SEVERITY_COLORS[sev];
    return `<text x="0" y="${textY}" font-family="ui-monospace, Menlo, Consolas, monospace" font-size="13" fill="#1f2328">${sev}</text>
  <rect x="90" y="${barY}" width="${width.toFixed(1)}" height="14" rx="3" fill="${color}"/>
  <text x="400" y="${textY}" font-family="ui-monospace, Menlo, Consolas, monospace" font-size="13" font-weight="bold" fill="${color}" text-anchor="end">${count}</text>`;
  }).join("");

  return `<svg viewBox="0 0 460 ${height}" width="100%" role="img" aria-label="Findings by severity">
  <title>Findings by severity: ${SEVERITY_ORDER.map((s) => `${s} ${counts[s]}`).join(", ")}</title>${rows}
</svg>`;
}

export interface ConformanceCounts {
  passed: number;
  failed: number;
  notApplicable: number;
  needsReview: number;
}

/** Horizontal stacked bar of conformance outcomes. */
export function conformanceBarChart(c: ConformanceCounts): string {
  const total = c.passed + c.failed + c.notApplicable + c.needsReview;
  if (total <= 0) {
    return `<p class="chart-empty">No conformance data.</p>`;
  }

  const width = 460;
  const segments = [
    { label: "Pass", value: c.passed, color: "#1a7f37" },
    { label: "Fail", value: c.failed, color: "#d1242f" },
    { label: "Not applicable", value: c.notApplicable, color: "#d0d7de" },
    { label: "Needs review", value: c.needsReview, color: "#9a6700" },
  ].filter((s) => s.value > 0);

  let x = 0;
  const rects = segments
    .map((s) => {
      const w = (s.value / total) * width;
      const rect = `<rect x="${x.toFixed(1)}" y="0" width="${w.toFixed(1)}" height="22" fill="${s.color}"/>`;
      x += w;
      return rect;
    })
    .join("");

  const legend = segments
    .map((s) => `<span class="legend"><span class="swatch" style="background:${s.color}"></span>${s.label} (${s.value})</span>`)
    .join("");

  return `<svg viewBox="0 0 ${width} 22" width="100%" role="img" aria-label="Conformance breakdown">
  <title>Conformance breakdown: ${segments.map((s) => `${s.label} ${s.value}`).join(", ")}</title>${rects}
</svg>
<div class="chart-legend">${legend}</div>`;
}
