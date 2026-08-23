import type { Finding } from "@/components/assessment/types";

// User-impact weight per severity. Critical failures block users outright; minor
// issues are polish. Weights drive the priority-first report (A2) — a single
// critical keyboard trap outranks many repeated low-impact issues.
const IMPACT_WEIGHT: Record<string, number> = {
  critical: 16,
  serious: 8,
  moderate: 4,
  minor: 1,
};

// Priority = user impact × reach. `elementCount` is the number of affected
// elements on the page, so a widespread issue ranks above a one-off of the same
// severity. Deterministic — see AC-Q-2.
function priorityScore(finding: Finding): number {
  const weight = IMPACT_WEIGHT[finding.impact] ?? 1;
  return weight * Math.max(1, finding.elementCount);
}

// Deterministic ordering for the priority-first report. Sorts by descending
// priority score; ties break by ruleId, then pageUrl, so the order is stable
// across runs given the same input.
export function priorityFindings(findings: Finding[]): Finding[] {
  return [...findings].sort((a, b) => {
    const diff = priorityScore(b) - priorityScore(a);
    if (diff !== 0) return diff;
    if (a.ruleId !== b.ruleId) return a.ruleId < b.ruleId ? -1 : 1;
    if (a.pageUrl !== b.pageUrl) return a.pageUrl < b.pageUrl ? -1 : 1;
    return 0;
  });
}
