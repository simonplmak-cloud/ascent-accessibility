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

const ELEMENT_LIMIT = 10;

export interface IbmPage {
  locator(selector: string): {
    first(): { screenshot(options?: { type?: "png" | "jpeg" }): Promise<Buffer> };
  };
}

interface IbmRuleMeta {
  id: string;
  rulesets?: Array<{ num: string | string[] }>;
}

let scCache: Map<string, string[]> | null = null;

async function loadRuleScMap(): Promise<Map<string, string[]>> {
  if (scCache) return scCache;
  const sc = new Map<string, string[]>();
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
      if (scs.size > 0) sc.set(rule.id, [...scs]);
    }
  } catch {
    /* engine unavailable — leave unmapped */
  }
  scCache = sc;
  return sc;
}

function impactForLevel(level: string): ToolFinding["impact"] {
  if (level === "violation") return "serious";
  if (level === "potentialviolation") return "moderate";
  return "minor";
}

export async function runIbmScan(page: IbmPage, url: string): Promise<IbmScanOutput> {
  try {
    const { getCompliance } = await import("accessibility-checker");
    const scMap = await loadRuleScMap();
    const result = await getCompliance(page, url);
    const report: IbmReport | undefined = result.report;
    if (!report) return EMPTY;

    const findings: ToolFinding[] = [];
    let screenshotCount = 0;
    for (const r of report.results) {
      if (!["violation", "potentialviolation", "recommendation"].includes(r.level)) continue;

      const wcagSc = scMap.get(r.ruleId) ?? [];
      const firstSc = wcagSc[0];

      let screenshot: Buffer | undefined;
      if (r.level !== "recommendation" && screenshotCount < ELEMENT_LIMIT && r.path?.dom) {
        try {
          screenshot = await page
            .locator(`xpath=${r.path.dom}`)
            .first()
            .screenshot({ type: "png" });
          screenshotCount += 1;
        } catch {
          /* element not locatable — skip */
        }
      }

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
            screenshot,
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
