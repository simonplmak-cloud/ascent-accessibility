import { describe, expect, it } from "vitest";
import { getRecommendation } from "@/lib/recommendations";

describe("RecommendationService", () => {
  it("returns actionable guidance for a curated rule", () => {
    const rec = getRecommendation("color-contrast", "serious");
    expect(rec.length).toBeGreaterThan(20);
    expect(rec.toLowerCase()).toContain("contrast");
  });

  it.each([
    "color-contrast",
    "image-alt",
    "link-name",
    "button-name",
    "label",
    "heading-order",
    "html-has-lang",
    "document-title",
    "duplicate-id",
    "aria-roles",
    "tabindex",
    "skip-link",
    "video-caption",
    "target-size",
  ])("returns a non-empty recommendation for %s", (ruleId) => {
    expect(getRecommendation(ruleId, "serious").length).toBeGreaterThan(10);
  });

  it("falls back to a usable recommendation for unknown rules", () => {
    const rec = getRecommendation("some-future-rule", "moderate");
    expect(rec).toContain("some-future-rule");
    expect(rec.length).toBeGreaterThan(0);
  });
});
