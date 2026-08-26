import type { Finding } from "./types";

export const SEVERITY_ORDER = ["critical", "serious", "moderate", "minor"] as const;
export type Severity = (typeof SEVERITY_ORDER)[number];

export function severityCounts(findings: Finding[]): Record<Severity, number> {
  const counts: Record<Severity, number> = {
    critical: 0,
    serious: 0,
    moderate: 0,
    minor: 0,
  };
  for (const finding of findings) {
    if (finding.impact in counts) counts[finding.impact as Severity] += 1;
  }
  return counts;
}

export function impactColor(impact: string): string {
  switch (impact) {
    case "critical":
      return "text-terminal-critical";
    case "serious":
      return "text-terminal-serious";
    case "moderate":
      return "text-terminal-moderate";
    default:
      return "text-terminal-muted";
  }
}
