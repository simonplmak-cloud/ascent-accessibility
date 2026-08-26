import { describe, expect, it } from "vitest";
import { impactColor, severityCounts } from "@/components/assessment/severity";
import type { Finding } from "@/components/assessment/types";

function finding(impact: string): Finding {
  return {
    ruleId: "r",
    impact,
    description: "d",
    pageUrl: "p",
    elementCount: 1,
    recommendation: "rec",
  };
}

describe("severity", () => {
  it("counts findings by severity", () => {
    const findings = [finding("critical"), finding("critical"), finding("serious"), finding("minor")];
    expect(severityCounts(findings)).toEqual({
      critical: 2,
      serious: 1,
      moderate: 0,
      minor: 1,
    });
  });

  it("maps impact to a color class", () => {
    expect(impactColor("critical")).toBe("text-terminal-critical");
    expect(impactColor("serious")).toBe("text-terminal-serious");
    expect(impactColor("moderate")).toBe("text-terminal-moderate");
    expect(impactColor("unknown")).toBe("text-terminal-muted");
  });
});
