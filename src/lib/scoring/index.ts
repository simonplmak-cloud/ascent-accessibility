import { getSc, type WcagLevel, type WcagSc } from "@/lib/standards/wcag-sc";
import { checkScApplicability, type PageFeatures } from "@/lib/standards/sc-applicability";

export type Impact = "critical" | "serious" | "moderate" | "minor";
export type PassBand = "pass" | "partial" | "fail";

// Stage 4 — the machine verdict (deterministic rules + applicability).
export type MachineVerdict = "Passed" | "Failed" | "Unresolved" | "NotPresent";

// Stage 6 — the final verdict (machine + AI, folded per SC), in the W3C/WAI
// conformance-evaluation vocabulary.
export type FinalVerdict = "Passed" | "Failed" | "CannotTell" | "NotPresent" | "NotChecked";

export const FINAL_VERDICT_LABELS: Record<FinalVerdict, string> = {
  Passed: "Passed",
  Failed: "Failed",
  CannotTell: "Cannot tell",
  NotPresent: "Not present",
  NotChecked: "Not checked",
};

// Legacy (pre-rename) verdicts normalized to the official vocabulary on read.
export function normalizeFinalVerdict(value: string): FinalVerdict {
  switch (value) {
    case "Passed":
      return "Passed";
    case "Failed":
      return "Failed";
    case "CannotTell":
      return "CannotTell";
    case "NotPresent":
      return "NotPresent";
    case "NotChecked":
      return "NotChecked";
    case "compliant":
      return "Passed";
    case "violate":
      return "Failed";
    case "need-human-checking":
    case "needs-review":
      return "CannotTell";
    case "not-applicable":
      return "NotPresent";
    default:
      return "CannotTell";
  }
}

export function normalizeMachineVerdict(value: string): MachineVerdict {
  switch (value) {
    case "Passed":
      return "Passed";
    case "Failed":
      return "Failed";
    case "Unresolved":
      return "Unresolved";
    case "NotPresent":
      return "NotPresent";
    case "compliant":
      return "Passed";
    case "violate":
      return "Failed";
    case "need-checking":
      return "Unresolved";
    case "not-applicable":
      return "NotPresent";
    default:
      return "Unresolved";
  }
}

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
  passed: number;
  failed: number;
  notPresent: number;
  unresolved: number;
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
  passed: number;
  failed: number;
  notPresent: number;
  cannotTell: number;
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
    if (failed.has(sc.num)) result = "Failed";
    else if (passedScs.has(sc.num)) result = "Passed";
    else if (checkScApplicability(sc.num, features) === "not-applicable") {
      result = "NotPresent";
    } else {
      result = "Unresolved";
    }
    return { num: sc.num, title: sc.title, level: sc.level, result };
  });

  const passed = rows.filter((r) => r.result === "Passed").length;
  const failedCount = rows.filter((r) => r.result === "Failed").length;
  const notPresent = rows.filter((r) => r.result === "NotPresent").length;
  const unresolved = rows.filter((r) => r.result === "Unresolved").length;
  const tested = passed + failedCount;
  const coverage = scs.length === 0 ? 0 : Math.round((tested / scs.length) * 100);

  return { total: scs.length, passed, failed: failedCount, notPresent, unresolved, coverage, rows };
}

// Stage 6 — fold AI verdicts into the final verdict per SC.
export function finalizeConformance(
  machine: MachineConformanceResult,
  resolved: ReadonlyMap<string, "Passed" | "Failed">,
): ConformanceResult {
  const rows: ScConformanceRow[] = machine.rows.map((row) => {
    let result: FinalVerdict;
    if (row.result === "Unresolved") {
      result = resolved.get(row.num) ?? "CannotTell";
    } else {
      result = row.result;
    }
    return { num: row.num, title: row.title, level: row.level, result, machineResult: row.result };
  });

  const passed = rows.filter((r) => r.result === "Passed").length;
  const failed = rows.filter((r) => r.result === "Failed").length;
  const notPresent = rows.filter((r) => r.result === "NotPresent").length;
  const cannotTell = rows.filter((r) => r.result === "CannotTell").length;
  const tested = passed + failed;
  const coverage = rows.length === 0 ? 0 : Math.round((tested / rows.length) * 100);

  let levelAttained: ConformanceResult["levelAttained"] = "none";
  const maxRank = rows.reduce((m, r) => Math.max(m, LEVEL_RANK[r.level]), 0);
  for (const level of ["A", "AA", "AAA"] as const) {
    if (LEVEL_RANK[level] > maxRank) break;
    const relevant = rows.filter((r) => LEVEL_RANK[r.level] <= LEVEL_RANK[level]);
    const hasFailed = relevant.some((r) => r.result === "Failed");
    const hasReview = relevant.some((r) => r.result === "CannotTell");
    if (!hasFailed && !hasReview) levelAttained = level;
  }

  return {
    total: rows.length,
    passed,
    failed,
    notPresent,
    cannotTell,
    coverage,
    levelAttained,
    rows,
  };
}
