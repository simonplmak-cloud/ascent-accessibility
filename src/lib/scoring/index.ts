export type Impact = "critical" | "serious" | "moderate" | "minor";
export type PassBand = "pass" | "partial" | "fail";

export interface ScoreResult {
  score: number;
  passBand: PassBand;
}

function weightOf(impact: Impact): number {
  switch (impact) {
    case "critical":
      return 10;
    case "serious":
      return 5;
    case "moderate":
      return 2;
    case "minor":
      return 0.5;
  }
}

export function computeScore(findings: readonly { impact: Impact }[]): ScoreResult {
  const penalty = findings.reduce((sum, finding) => sum + weightOf(finding.impact), 0);
  // Floor to an integer so the score matches the integer column and never
  // overstates compliance (a single minor finding drops 100 → 99).
  const score = Math.max(0, Math.floor(100 - penalty));
  const passBand: PassBand = score >= 90 ? "pass" : score >= 70 ? "partial" : "fail";
  return { score, passBand };
}
