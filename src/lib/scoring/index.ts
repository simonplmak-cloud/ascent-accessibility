import { getSc, type WcagLevel, type WcagSc } from "@/lib/standards/wcag-sc";
import { checkScApplicability, type PageFeatures } from "@/lib/standards/sc-applicability";

export type Impact = "critical" | "serious" | "moderate" | "minor";
export type PassBand = "pass" | "partial" | "fail";

// Stage 4 — the machine verdict (deterministic rules + applicability).
export type MachineVerdict = "compliant" | "violate" | "need-checking" | "not-applicable";

// Stage 6 — the final verdict (machine + AI, folded per SC).
export type FinalVerdict = "compliant" | "violate" | "need-human-checking" | "not-applicable";

export interface ScoreResult {
  score: number;
  passBand: PassBand;
}

export interface MachineRow {
  num: string;
  title: string;
  level: WcagLevel;
  result: MachineVerdict;
}

export interface MachineConformanceResult {
  total: number;
  compliant: number;
  violate: number;
  notApplicable: number;
  needChecking: number;
  coverage: number;
  rows: MachineRow[];
}

export interface ScConformanceRow {
  num: string;
  title: string;
  level: WcagLevel;
  result: FinalVerdict;
  machineResult: MachineVerdict;
}

export interface ConformanceResult {
  total: number;
  compliant: number;
  violate: number;
  notApplicable: number;
  needHumanChecking: number;
  coverage: number;
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

// Stage 4 — machine verdict per applicable SC.
export function computeConformance(
  scs: readonly WcagSc[],
  findings: readonly { wcagSc: string[] }[],
  passedScs: ReadonlySet<string>,
  features: PageFeatures,
): MachineConformanceResult {
  const failed = new Set<string>();
  for (const finding of findings) {
    for (const sc of finding.wcagSc) {
      if (getSc(sc)) failed.add(sc);
    }
  }

  const rows: MachineRow[] = scs.map((sc) => {
    let result: MachineVerdict;
    if (failed.has(sc.num)) result = "violate";
    else if (passedScs.has(sc.num)) result = "compliant";
    else if (checkScApplicability(sc.num, features) === "not-applicable") {
      result = "not-applicable";
    } else {
      result = "need-checking";
    }
    return { num: sc.num, title: sc.title, level: sc.level, result };
  });

  const compliant = rows.filter((r) => r.result === "compliant").length;
  const violate = rows.filter((r) => r.result === "violate").length;
  const notApplicable = rows.filter((r) => r.result === "not-applicable").length;
  const needChecking = rows.filter((r) => r.result === "need-checking").length;
  const tested = compliant + violate;
  const coverage = scs.length === 0 ? 0 : Math.round((tested / scs.length) * 100);

  return { total: scs.length, compliant, violate, notApplicable, needChecking, coverage, rows };
}

// Stage 6 — fold AI verdicts into the final verdict per SC.
export function finalizeConformance(
  machine: MachineConformanceResult,
  resolved: ReadonlyMap<string, "compliant" | "violate">,
): ConformanceResult {
  const rows: ScConformanceRow[] = machine.rows.map((row) => {
    let result: FinalVerdict;
    if (row.result === "need-checking") {
      result = resolved.get(row.num) ?? "need-human-checking";
    } else {
      result = row.result;
    }
    return { num: row.num, title: row.title, level: row.level, result, machineResult: row.result };
  });

  const compliant = rows.filter((r) => r.result === "compliant").length;
  const violate = rows.filter((r) => r.result === "violate").length;
  const notApplicable = rows.filter((r) => r.result === "not-applicable").length;
  const needHumanChecking = rows.filter((r) => r.result === "need-human-checking").length;
  const tested = compliant + violate;
  const coverage = rows.length === 0 ? 0 : Math.round((tested / rows.length) * 100);

  let levelAttained: ConformanceResult["levelAttained"] = "none";
  const maxRank = rows.reduce((m, r) => Math.max(m, LEVEL_RANK[r.level]), 0);
  for (const level of ["A", "AA", "AAA"] as const) {
    if (LEVEL_RANK[level] > maxRank) break;
    const relevant = rows.filter((r) => LEVEL_RANK[r.level] <= LEVEL_RANK[level]);
    const hasViolate = relevant.some((r) => r.result === "violate");
    const hasReview = relevant.some((r) => r.result === "need-human-checking");
    if (!hasViolate && !hasReview) levelAttained = level;
  }

  return {
    total: rows.length,
    compliant,
    violate,
    notApplicable,
    needHumanChecking,
    coverage,
    levelAttained,
    rows,
  };
}
