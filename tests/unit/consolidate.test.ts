import { describe, expect, it } from "vitest";
import {
  axeViolationsToFindings,
  consolidateFindings,
  type ToolFinding,
} from "@/lib/comparison/consolidate";

const axeViolation = {
  id: "color-contrast",
  impact: "serious" as const,
  description: "desc",
  help: "help",
  helpUrl: "url",
  tags: ["wcag2aa", "wcag143"],
  nodes: [{ html: "<a>", target: ["a"], failureSummary: "fs" }],
  nodeCount: 1,
};

function ibmFinding(ruleId: string, sc: string, pageUrl = "https://x.com/"): ToolFinding {
  return {
    tool: "ibm",
    ruleId,
    impact: "serious",
    message: "message",
    help: "",
    helpUrl: "",
    wcagSc: [sc],
    wcagLevel: "AA",
    pageUrl,
    nodes: [{ target: "/html", html: "<body>", failureSummary: "", evidenceId: null }],
  };
}

describe("axeViolationsToFindings", () => {
  it("chains axe violations to WCAG SCs", () => {
    const findings = axeViolationsToFindings("https://x.com/", [axeViolation]);
    expect(findings[0]).toMatchObject({
      tool: "axe",
      ruleId: "color-contrast",
      wcagSc: ["1.4.3"],
      wcagLevel: "AA",
    });
  });
});

describe("consolidateFindings", () => {
  it("merges same-SC findings and marks them confirmed", () => {
    const axe = axeViolationsToFindings("https://x.com/", [axeViolation]);
    const ibm = [ibmFinding("IBMa_Color_Contrast", "1.4.3")];
    const result = consolidateFindings(axe, ibm);

    expect(result).toHaveLength(1);
    expect(result[0]!.confidence).toBe("confirmed");
    const tools = new Set(result[0]!.sources.map((s) => s.tool));
    expect(tools).toEqual(new Set(["axe", "lighthouse", "ibm"]));
  });

  it("keeps single-source IBM findings separate", () => {
    const axe = axeViolationsToFindings("https://x.com/", [axeViolation]);
    const ibm = [ibmFinding("IBMa_Spacing", "1.4.12")];
    const result = consolidateFindings(axe, ibm);

    expect(result).toHaveLength(2);
    const spacing = result.find((f) => f.ruleId === "IBMa_Spacing");
    expect(spacing?.confidence).toBe("single-source");
    expect(spacing?.wcagSc).toEqual(["1.4.12"]);
  });
});
