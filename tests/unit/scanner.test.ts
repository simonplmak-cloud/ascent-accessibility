import { describe, expect, it } from "vitest";
import { mapViolations, mapRuleSummary } from "@/lib/scanner";

const rawResult = {
  violations: [
    {
      id: "color-contrast",
      impact: "serious",
      description: "Elements must meet minimum color contrast ratio thresholds",
      help: "Color contrast",
      helpUrl: "https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html",
      tags: ["wcag2aa", "wcag143"],
      nodes: [
        { html: "<a>", target: ["a"], failureSummary: "Fix contrast" },
        { html: "<b>", target: ["b"], failureSummary: "Fix contrast" },
      ],
    },
    {
      id: "image-alt",
      impact: null,
      description: "Ensures <img> elements have alternate text",
      nodes: [{ html: "<img>", target: ["img"], failureSummary: "" }],
    },
  ],
  passes: [{ id: "region", tags: ["wcag2aa"] }],
  incomplete: [],
};

describe("mapViolations", () => {
  it("maps impact, description, node count, tags, help, and nodes", () => {
    const mapped = mapViolations(rawResult);
    expect(mapped).toHaveLength(2);
    expect(mapped[0]).toMatchObject({
      id: "color-contrast",
      impact: "serious",
      nodeCount: 2,
      tags: ["wcag2aa", "wcag143"],
      help: "Color contrast",
    });
    expect(mapped[0]?.nodes[0]).toMatchObject({ html: "<a>", target: ["a"] });
  });

  it("normalizes a null impact to minor", () => {
    expect(
      mapViolations({
        violations: [{ id: "x", impact: null, description: "", nodes: [] }],
        passes: [],
        incomplete: [],
      })[0]?.impact,
    ).toBe("minor");
  });
});

describe("mapRuleSummary", () => {
  it("preserves incomplete nodes so the AI triage can review them", () => {
    const summary = mapRuleSummary({
      id: "button-name",
      tags: ["wcag2a"],
      nodes: [{ html: "<button>", target: ["button"], failureSummary: "undecidable" }],
    });
    expect(summary.nodes?.[0]).toMatchObject({
      target: ["button"],
      failureSummary: "undecidable",
    });
  });
});
