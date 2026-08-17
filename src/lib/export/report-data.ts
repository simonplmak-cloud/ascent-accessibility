// Pure report-data helpers. No PDF/HTML/network — node-unit-testable.
import type { ReportFinding } from "./types";

export const SEVERITY_ORDER = ["critical", "serious", "moderate", "minor"] as const;

// Print-safe severity palette (accessible on white — GitHub Primer).
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

export interface SeverityGroup {
  severity: string;
  items: ReportFinding[];
}

export function groupFindingsBySeverity(findings: ReportFinding[]): SeverityGroup[] {
  return SEVERITY_ORDER.map((severity) => ({
    severity,
    items: findings.filter((f) => f.impact === severity),
  })).filter((g) => g.items.length > 0);
}

export function topIssues(findings: ReportFinding[], limit = 5): ReportFinding[] {
  return [...findings]
    .sort((a, b) => severityRank(a.impact) - severityRank(b.impact))
    .slice(0, limit);
}

export interface AffectedSc {
  sc: string;
  title: string;
  severity: string;
  elements: number;
}

/** Success criteria with findings, highest severity per SC. */
export function affectedSuccessCriteria(findings: ReportFinding[]): AffectedSc[] {
  const map = new Map<string, { title: string; severity: string; elements: number }>();
  for (const finding of findings) {
    for (const sc of finding.wcagSc ?? []) {
      const existing = map.get(sc);
      if (existing) {
        existing.elements += finding.elementCount;
        if (severityRank(finding.impact) < severityRank(existing.severity)) {
          existing.severity = finding.impact;
        }
      } else {
        map.set(sc, {
          title: finding.scTitle ?? "",
          severity: finding.impact,
          elements: finding.elementCount,
        });
      }
    }
  }
  return [...map.entries()]
    .map(([sc, v]) => ({ sc, ...v }))
    .sort((a, b) => a.sc.localeCompare(b.sc));
}

export function generatedDate(generatedAt?: string): string {
  const value = generatedAt ?? new Date().toISOString();
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toUTCString();
}
