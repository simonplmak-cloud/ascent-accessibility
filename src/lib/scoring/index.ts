import { WCAG_SCS, getSc, type WcagLevel } from "@/lib/standards/wcag-sc";

export type Impact = "critical" | "serious" | "moderate" | "minor";
export type PassBand = "pass" | "partial" | "fail";
export type ScResult = "pass" | "fail" | "not-tested";

export interface ScoreResult {
  score: number;
  passBand: PassBand;
}

export interface ScConformanceRow {
  num: string;
  title: string;
  level: WcagLevel;
  result: ScResult;
}

export interface ConformanceResult {
  total: number;
  passed: number;
  failed: number;
  notTested: number;
  levelAttained: "A" | "AA" | "AAA" | "none";
  rows: ScConformanceRow[];
}

const IMPACT_WEIGHT: Record<Impact, number> = {
  critical: 10,
  serious: 5,
  moderate: 2,
  minor: 0.5,
};

const INSTANCE_CAP = 10;

const LEVEL_RANK: Record<WcagLevel, number> = { A: 1, AA: 2, AAA: 3 };

export function weightOf(impact: Impact): number {
  return IMPACT_WEIGHT[impact];
}

export function computeScore(
  findings: readonly { impact: Impact; elementCount?: number }[],
): ScoreResult {
  const penalty = findings.reduce((sum, finding) => {
    const instances = Math.min(finding.elementCount ?? 1, INSTANCE_CAP);
    return sum + weightOf(finding.impact) * instances;
  }, 0);
  const score = Math.max(0, Math.floor(100 - penalty));
  const passBand: PassBand = score >= 90 ? "pass" : score >= 70 ? "partial" : "fail";
  return { score, passBand };
}

export function computeConformance(
  findings: readonly { wcagSc: string[] }[],
  testedScs: ReadonlySet<string>,
  targetLevel: WcagLevel,
): ConformanceResult {
  const failed = new Set<string>();
  for (const finding of findings) {
    for (const sc of finding.wcagSc) {
      if (getSc(sc)) failed.add(sc);
    }
  }

  const applicable = WCAG_SCS.filter((sc) => LEVEL_RANK[sc.level] <= LEVEL_RANK[targetLevel]);

  const rows: ScConformanceRow[] = applicable.map((sc) => {
    let result: ScResult;
    if (failed.has(sc.num)) result = "fail";
    else if (testedScs.has(sc.num)) result = "pass";
    else result = "not-tested";
    return { num: sc.num, title: sc.title, level: sc.level, result };
  });

  const passed = rows.filter((row) => row.result === "pass").length;
  const failedCount = rows.filter((row) => row.result === "fail").length;
  const notTested = rows.filter((row) => row.result === "not-tested").length;

  let levelAttained: ConformanceResult["levelAttained"] = "none";
  for (const level of ["A", "AA", "AAA"] as const) {
    const hasFail = rows.some(
      (row) => row.result === "fail" && LEVEL_RANK[row.level] <= LEVEL_RANK[level],
    );
    if (!hasFail) levelAttained = level;
  }

  return { total: applicable.length, passed, failed: failedCount, notTested, levelAttained, rows };
}
