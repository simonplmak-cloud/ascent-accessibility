import type { Finding, FindingInstance } from "@/db/schema";
import type { Impact } from "@/lib/scoring";
import { getRecommendation } from "@/lib/recommendations";
import { getSc, scsForTags } from "@/lib/standards/wcag-sc";
import type { ScanViolation } from "@/lib/scanner";

export interface ToolFinding {
  tool: "engine";
  ruleId: string;
  impact: Impact;
  message: string;
  help: string;
  helpUrl: string;
  wcagSc: string[];
  wcagLevel: "A" | "AA" | "AAA" | null;
  pageUrl: string;
  nodes: Array<{
    target: string;
    html: string;
    failureSummary: string;
    evidenceId: string | null;
    screenshot?: Buffer;
  }>;
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
    recommendation: getRecommendation(finding.ruleId, finding.impact, finding.help),
    help: finding.help,
    helpUrl: finding.helpUrl,
    wcagSc: finding.wcagSc,
    wcagLevel: scInfo?.level ?? null,
    scTitle: scInfo?.title ?? "Best practice",
    confidence: "single-source",
    sources: [
      { tool: "engine", ruleId: finding.ruleId, impact: finding.impact, message: finding.message },
    ],
    instances: finding.nodes.map(toInstance),
  };
}

export function violationsToFindings(
  pageUrl: string,
  violations: ScanViolation[],
): ToolFinding[] {
  return violations.map((violation) => {
    const declared = violation.wcagSc ?? [];
    const wcagSc = (declared.length > 0 ? declared : scsForTags(violation.tags)).filter(
      (sc) => getSc(sc) !== undefined,
    );
    const firstSc = wcagSc[0];
    return {
      tool: "engine",
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

export function consolidateFindings(engineFindings: ToolFinding[]): Finding[] {
  const groups = new Map<string, Finding>();

  for (const f of engineFindings) {
    const key = groupKey(f);
    if (!groups.has(key)) {
      groups.set(key, baseFinding(f));
    }
  }

  return [...groups.values()].sort(
    (a, b) => IMPACT_RANK[b.impact] - IMPACT_RANK[a.impact],
  );
}
