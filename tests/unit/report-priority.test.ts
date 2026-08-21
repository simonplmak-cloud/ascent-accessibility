import { describe, expect, it } from "vitest";
import { priorityFindings, topFindings } from "@/lib/report-priority";
import type { Finding } from "@/components/assessment/types";

function finding(overrides: Partial<Finding>): Finding {
  return {
    ruleId: "rule",
    impact: "minor",
    description: "d",
    pageUrl: "https://example.com/",
    elementCount: 1,
    recommendation: "r",
    ...overrides,
  };
}

describe("priorityFindings", () => {
  it("orders by impact first (critical beats many minor)", () => {
    const result = priorityFindings([
      finding({ ruleId: "minor-many", impact: "minor", elementCount: 10 }),
      finding({ ruleId: "critical-one", impact: "critical", elementCount: 1 }),
    ]);
    expect(result[0]?.ruleId).toBe("critical-one");
  });

  it("uses reach (elementCount) to break severity ties", () => {
    const result = priorityFindings([
      finding({ ruleId: "serious-few", impact: "serious", elementCount: 1 }),
      finding({ ruleId: "serious-many", impact: "serious", elementCount: 5 }),
    ]);
    expect(result[0]?.ruleId).toBe("serious-many");
  });

  it("a low-frequency critical outranks a high-frequency serious", () => {
    const result = priorityFindings([
      finding({ ruleId: "serious-many", impact: "serious", elementCount: 5 }), // 8*5=40
      finding({ ruleId: "critical-one", impact: "critical", elementCount: 3 }), // 16*3=48
    ]);
    expect(result[0]?.ruleId).toBe("critical-one");
  });

  it("breaks exact ties deterministically by ruleId then pageUrl", () => {
    const result = priorityFindings([
      finding({ ruleId: "b", impact: "serious", elementCount: 2, pageUrl: "https://b.com/" }),
      finding({ ruleId: "a", impact: "serious", elementCount: 2, pageUrl: "https://a.com/" }),
    ]);
    expect(result[0]?.ruleId).toBe("a");
  });

  it("does not mutate the input array", () => {
    const input = [finding({ ruleId: "z", impact: "minor" }), finding({ ruleId: "a", impact: "critical" })];
    const copy = [...input];
    priorityFindings(input);
    expect(input).toEqual(copy);
  });
});

describe("topFindings", () => {
  it("returns the top N by priority", () => {
    const many = Array.from({ length: 8 }, (_, i) =>
      finding({ ruleId: `r${i}`, impact: i === 0 ? "critical" : "minor", elementCount: 1 }),
    );
    const top = topFindings(many, 5);
    expect(top).toHaveLength(5);
    expect(top[0]?.impact).toBe("critical");
  });

  it("returns everything when fewer than N findings", () => {
    expect(topFindings([finding({ ruleId: "only" })], 5)).toHaveLength(1);
  });
});
