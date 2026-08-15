import type { Finding, FindingInstance, FindingSource } from "@/db/schema";
import type { Impact } from "@/lib/scoring";
import { getRecommendation } from "@/lib/recommendations";
import { getSc, scsForTags } from "@/lib/standards/wcag-sc";
import { LIGHTHOUSE_AUDIT_WEIGHTS } from "@/lib/standards/lighthouse-audits";
import type { AxeViolation } from "@/lib/scanner";

export interface ToolFinding {
  tool: "axe" | "ibm";
  ruleId: string;
  impact: Impact;
  message: string;
  help: string;
  helpUrl: string;
  wcagSc: string[];
  wcagLevel: "A" | "AA" | "AAA" | null;
  pageUrl: string;
  nodes: Array<{ target: string; html: string; failureSummary: string; evidenceId: string | null }>;
}

const IMPACT_RANK: Record<Impact, number> = { critical: 4, serious: 3, moderate: 2, minor: 1 };

function primarySc(finding: ToolFinding): string | null {
  return finding.wcagSc[0] ?? null;
}

function groupKey(finding: ToolFinding): string {
  const sc = primarySc(finding);
  return `${sc ? `sc:${sc}` : `rule:${finding.ruleId}`}|${finding.pageUrl}`;
}

function toInstance(node: ToolFinding["nodes"][number]): FindingInstance {
  return {
    target: node.target,
    html: node.html,
    failureSummary: node.failureSummary,
    evidenceId: node.evidenceId,
  };
}

function baseFinding(finding: ToolFinding): Finding {
  const sc = primarySc(finding);
  const scInfo = sc ? getSc(sc) : undefined;
  return {
    ruleId: finding.ruleId,
    impact: finding.impact,
    description: finding.message,
    pageUrl: finding.pageUrl,
    elementCount: finding.nodes.length,
    recommendation: getRecommendation(finding.ruleId, finding.impact),
    help: finding.help,
    helpUrl: finding.helpUrl,
    wcagSc: finding.wcagSc,
    wcagLevel: scInfo?.level ?? null,
    scTitle: scInfo?.title ?? "Best practice",
    confidence: "single-source",
    sources: [],
    instances: finding.nodes.map(toInstance),
  };
}

function addSource(finding: Finding, f: ToolFinding, tool: FindingSource["tool"]): void {
  finding.sources.push({ tool, ruleId: f.ruleId, impact: f.impact, message: f.message });
  if (IMPACT_RANK[f.impact] > IMPACT_RANK[finding.impact]) finding.impact = f.impact;
}

export function axeViolationsToFindings(
  pageUrl: string,
  violations: AxeViolation[],
): ToolFinding[] {
  return violations.map((violation) => {
    const wcagSc = scsForTags(violation.tags);
    const firstSc = wcagSc[0];
    return {
      tool: "axe",
      ruleId: violation.id,
      impact: violation.impact,
      message: violation.description,
      help: violation.help,
      helpUrl: violation.helpUrl,
      wcagSc,
      wcagLevel: firstSc ? (getSc(firstSc)?.level ?? null) : null,
      pageUrl,
      nodes: violation.nodes.map((node) => ({
        target: node.target[0] ?? "",
        html: node.html,
        failureSummary: node.failureSummary,
        evidenceId: null,
      })),
    };
  });
}

export function consolidateFindings(
  axeFindings: ToolFinding[],
  ibmFindings: ToolFinding[],
): Finding[] {
  const groups = new Map<string, Finding>();

  for (const f of axeFindings) {
    const key = groupKey(f);
    let finding = groups.get(key);
    if (!finding) {
      finding = baseFinding(f);
      groups.set(key, finding);
    }
    addSource(finding, f, "axe");
    if (LIGHTHOUSE_AUDIT_WEIGHTS[f.ruleId] !== undefined) {
      addSource(finding, f, "lighthouse");
    }
  }

  for (const f of ibmFindings) {
    const key = groupKey(f);
    let finding = groups.get(key);
    if (!finding) {
      finding = baseFinding(f);
      groups.set(key, finding);
    }
    addSource(finding, f, "ibm");
    for (const node of f.nodes) {
      finding.instances.push(toInstance(node));
    }
  }

  for (const finding of groups.values()) {
    const tools = new Set(finding.sources.map((source) => source.tool));
    finding.confidence = tools.size >= 2 ? "confirmed" : "single-source";
    finding.elementCount = finding.instances.length;
  }

  return [...groups.values()].sort(
    (a, b) => IMPACT_RANK[b.impact] - IMPACT_RANK[a.impact],
  );
}
