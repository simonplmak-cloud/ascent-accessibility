import { describe, expect, it } from "vitest";
import {
  affectedSuccessCriteria,
  groupFindingsBySeverity,
  passBandColor,
  severityColor,
  severityCounts,
  severityRank,
  topIssues,
} from "@/lib/export/report-data";
import type { ReportFinding } from "@/lib/export/types";

function finding(partial: Partial<ReportFinding>): ReportFinding {
  return {
    ruleId: "rule",
    impact: "minor",
    description: "d",
    pageUrl: "https://example.com/",
    elementCount: 1,
    recommendation: "r",
    ...partial,
  };
}

describe("severityCounts", () => {
  it("counts findings by severity", () => {
    expect(
      severityCounts([
        finding({ impact: "critical" }),
        finding({ impact: "critical" }),
        finding({ impact: "serious" }),
        finding({ impact: "minor" }),
      ]),
    ).toEqual({ critical: 2, serious: 1, moderate: 0, minor: 1 });
  });

  it("treats an unknown impact as minor and handles an empty list", () => {
    expect(severityCounts([finding({ impact: "weird" })]).minor).toBe(1);
    expect(severityCounts([])).toEqual({ critical: 0, serious: 0, moderate: 0, minor: 0 });
  });
});

describe("severityColor / passBandColor / severityRank", () => {
  it("maps known values", () => {
    expect(severityColor("critical")).toBe("#d1242f");
    expect(severityColor("serious")).toBe("#bc4c00");
    expect(passBandColor("pass")).toBe("#1a7f37");
    expect(passBandColor("partial")).toBe("#9a6700");
    expect(passBandColor("fail")).toBe("#d1242f");
    expect(severityRank("critical")).toBe(0);
    expect(severityRank("minor")).toBe(3);
  });

  it("falls back for unknown values", () => {
    expect(severityColor("nope")).toBe("#59636e");
    expect(passBandColor("nope")).toBe("#59636e");
    expect(severityRank("nope")).toBe(4);
  });
});

describe("groupFindingsBySeverity", () => {
  it("groups by severity, highest first, omitting empty groups", () => {
    const groups = groupFindingsBySeverity([
      finding({ impact: "moderate" }),
      finding({ impact: "critical" }),
      finding({ impact: "moderate" }),
    ]);
    expect(groups.map((g) => g.severity)).toEqual(["critical", "moderate"]);
    expect(groups[0]!.items).toHaveLength(1);
    expect(groups[1]!.items).toHaveLength(2);
  });

  it("returns an empty list for no findings", () => {
    expect(groupFindingsBySeverity([])).toEqual([]);
  });
});

describe("topIssues", () => {
  it("returns highest-severity findings first, capped at the limit", () => {
    const findings = [
      finding({ impact: "minor", ruleId: "a" }),
      finding({ impact: "critical", ruleId: "b" }),
      finding({ impact: "serious", ruleId: "c" }),
    ];
    expect(topIssues(findings, 2).map((f) => f.impact)).toEqual(["critical", "serious"]);
  });
});

describe("affectedSuccessCriteria", () => {
  it("aggregates findings by WCAG SC, keeping the highest severity", () => {
    const rows = affectedSuccessCriteria([
      finding({ wcagSc: ["1.4.3"], scTitle: "Contrast (Minimum)", impact: "serious", elementCount: 3 }),
      finding({ wcagSc: ["1.4.3"], scTitle: "Contrast (Minimum)", impact: "moderate", elementCount: 2 }),
      finding({ wcagSc: ["1.1.1"], scTitle: "Non-text Content", impact: "critical", elementCount: 1 }),
    ]);
    expect(rows).toHaveLength(2);
    const contrast = rows.find((r) => r.sc === "1.4.3");
    expect(contrast?.severity).toBe("serious");
    expect(contrast?.elements).toBe(5);
    expect(rows).toContainEqual({ sc: "1.1.1", title: "Non-text Content", severity: "critical", elements: 1 });
  });

  it("returns an empty list for no findings", () => {
    expect(affectedSuccessCriteria([])).toEqual([]);
  });
});
