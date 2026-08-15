import type { IbmReport } from "accessibility-checker";
import { getSc } from "@/lib/standards/wcag-sc";
import type { ToolFinding } from "./consolidate";

export interface IbmCounts {
  violation: number;
  potentialViolation: number;
  recommendation: number;
  pass: number;
  manual: number;
}

export interface IbmScanOutput {
  counts: IbmCounts;
  findings: ToolFinding[];
}

const EMPTY: IbmScanOutput = {
  counts: { violation: 0, potentialViolation: 0, recommendation: 0, pass: 0, manual: 0 },
  findings: [],
};

let ruleScCache: Map<string, string[]> | null = null;

interface IbmRuleMeta {
  id: string;
  rulesets?: Array<{ num: string | string[] }>;
}

async function loadRuleScMap(): Promise<Map<string, string[]>> {
  if (ruleScCache) return ruleScCache;
  const map = new Map<string, string[]>();
  try {
    const { getRules } = await import("accessibility-checker");
    const rules = (await getRules()) as IbmRuleMeta[];
    for (const rule of rules) {
      const scs = new Set<string>();
      for (const rs of rule.rulesets ?? []) {
        for (const num of Array.isArray(rs.num) ? rs.num : [rs.num]) {
          if (typeof num === "string" && /^\d+\.\d+\.\d+$/.test(num) && getSc(num)) {
            scs.add(num);
          }
        }
      }
      if (scs.size > 0) map.set(rule.id, [...scs]);
    }
  } catch {
    /* engine unavailable — leave unmapped */
  }
  ruleScCache = map;
  return map;
}

function impactForLevel(level: string): ToolFinding["impact"] {
  if (level === "violation") return "serious";
  if (level === "potentialviolation") return "moderate";
  return "minor";
}

export async function runIbmScan(page: unknown, url: string): Promise<IbmScanOutput> {
  try {
    const { getCompliance } = await import("accessibility-checker");
    const scMap = await loadRuleScMap();
    const result = await getCompliance(page, url);
    const report: IbmReport | undefined = result.report;
    if (!report) return EMPTY;

    const findings: ToolFinding[] = [];
    for (const r of report.results) {
      if (!["violation", "potentialviolation", "recommendation"].includes(r.level)) continue;
      const wcagSc = scMap.get(r.ruleId) ?? [];
      const firstSc = wcagSc[0];
      findings.push({
        tool: "ibm",
        ruleId: r.ruleId,
        impact: impactForLevel(r.level),
        message: r.message,
        help: r.message,
        helpUrl: "",
        wcagSc,
        wcagLevel: firstSc ? (getSc(firstSc)?.level ?? null) : null,
        pageUrl: url,
        nodes: [
          {
            target: r.path?.dom ?? "",
            html: r.snippet ?? "",
            failureSummary: r.message,
            evidenceId: null,
          },
        ],
      });
    }

    const counts = report.summary.counts;
    return {
      counts: {
        violation: counts.violation,
        potentialViolation: counts.potentialviolation,
        recommendation: counts.recommendation,
        pass: counts.pass,
        manual: counts.manual,
      },
      findings,
    };
  } catch {
    return EMPTY;
  }
}
