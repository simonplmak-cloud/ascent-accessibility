import { describe, expect, it } from "vitest";
import { priorityFindings } from "@/lib/report-priority";
import { severityCounts } from "@/components/assessment/severity";
import type { Finding } from "@/components/assessment/types";

// AC-Q-2 (Reliable): given the same input, the report computations produce
// byte-identical output. The engine and scoring are pure; AI calls are seeded
// (temperature 0, top_p 1, seed 42). This test pins determinism for the
// report-ordering and severity aggregation introduced in Phase 1.

const FIXTURE: Finding[] = [
  { ruleId: "image-alt", impact: "critical", description: "d", pageUrl: "https://a.com/", elementCount: 4, recommendation: "r" },
  { ruleId: "contrast", impact: "serious", description: "d", pageUrl: "https://a.com/", elementCount: 12, recommendation: "r" },
  { ruleId: "label", impact: "serious", description: "d", pageUrl: "https://a.com/form", elementCount: 3, recommendation: "r" },
  { ruleId: "heading-order", impact: "moderate", description: "d", pageUrl: "https://a.com/", elementCount: 2, recommendation: "r" },
  { ruleId: "link-name", impact: "minor", description: "d", pageUrl: "https://a.com/nav", elementCount: 9, recommendation: "r" },
];

describe("determinism (AC-Q-2)", () => {
  it("priorityFindings yields byte-identical ordering across repeated runs", () => {
    const first = JSON.stringify(priorityFindings(FIXTURE));
    for (let i = 0; i < 25; i += 1) {
      // Shuffle input order; the output ordering must not change.
      const shuffled = [...FIXTURE].sort(() => 0.5 - ((i * 37) % 10) / 10);
      expect(JSON.stringify(priorityFindings(shuffled))).toBe(first);
    }
  });

  it("severityCounts is order-independent", () => {
    const a = severityCounts(FIXTURE);
    const b = severityCounts([...FIXTURE].reverse());
    expect(b).toEqual(a);
    expect(a).toEqual({ critical: 1, serious: 2, moderate: 1, minor: 1 });
  });
});
