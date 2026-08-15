import type { IbmReport } from "accessibility-checker";
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

function impactForLevel(level: string): ToolFinding["impact"] {
  if (level === "violation") return "serious";
  if (level === "potentialviolation") return "moderate";
  return "minor";
}

export async function runIbmScan(page: unknown, url: string): Promise<IbmScanOutput> {
  try {
    const { getCompliance } = await import("accessibility-checker");
    const result = await getCompliance(page, url);
    const report: IbmReport | undefined = result.report;
    if (!report) return EMPTY;

    const findings: ToolFinding[] = [];
    for (const r of report.results) {
      if (!["violation", "potentialviolation", "recommendation"].includes(r.level)) continue;
      findings.push({
        tool: "ibm",
        ruleId: r.ruleId,
        impact: impactForLevel(r.level),
        message: r.message,
        help: r.message,
        helpUrl: "",
        wcagSc: [],
        wcagLevel: null,
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
