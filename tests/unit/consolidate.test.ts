import { describe, expect, it } from "vitest";
import { violationsToFindings, consolidateFindings } from "@/lib/comparison/consolidate";

const engineViolation = {
  id: "color-contrast",
  impact: "serious" as const,
  description: "desc",
  help: "help",
  helpUrl: "url",
  tags: ["wcag2aa", "wcag143"],
  nodes: [{ html: "<a>", target: ["a"], failureSummary: "fs" }],
  nodeCount: 1,
};

describe("violationsToFindings", () => {
  it("chains engine violations to WCAG SCs", () => {
    const findings = violationsToFindings("https://x.com/", [engineViolation]);
    expect(findings[0]).toMatchObject({
      tool: "engine",
      ruleId: "color-contrast",
      wcagSc: ["1.4.3"],
      wcagLevel: "AA",
    });
  });
});

describe("consolidateFindings", () => {
  it("groups findings by SC + page and marks them single-source", () => {
    const engine = violationsToFindings("https://x.com/", [engineViolation]);
    const result = consolidateFindings(engine);

    expect(result).toHaveLength(1);
    expect(result[0]!.confidence).toBe("single-source");
    expect(result[0]!.sources.map((s) => s.tool)).toEqual(["engine"]);
  });

  it("keeps distinct SCs separate", () => {
    const engine = violationsToFindings("https://x.com/", [
      engineViolation,
      { ...engineViolation, id: "button-name", tags: ["wcag2a", "wcag412"] },
    ]);
    const result = consolidateFindings(engine);
    expect(result).toHaveLength(2);
  });

  it("dedupes repeated findings for the same SC and page", () => {
    const engine = violationsToFindings("https://x.com/", [
      engineViolation,
      { ...engineViolation },
    ]);
    const result = consolidateFindings(engine);
    expect(result).toHaveLength(1);
    expect(result[0]!.sources).toHaveLength(1);
  });
});
