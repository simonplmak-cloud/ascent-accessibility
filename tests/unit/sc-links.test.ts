import { describe, expect, it } from "vitest";
import { linksForSc } from "@/lib/site/sc-links";

describe("linksForSc", () => {
  it("resolves understanding, manual test, remediation, and a lesson for a taught SC", () => {
    const links = linksForSc("1.1.1");
    expect(links.understanding).toContain("Understanding");
    expect(links.manualTest.length).toBeGreaterThan(0);
    expect(links.remediation.length).toBeGreaterThan(0);
    // First-match wins: 1.1.1 is taught in the everyday intro lesson before its deep dive.
    expect(links.lessonHref).toBe("/training/lessons/everyday-alt-text");
  });

  it("always returns manual test and remediation fallbacks", () => {
    const links = linksForSc("2.4.7");
    expect(links.manualTest.length).toBeGreaterThan(0);
    expect(links.remediation.length).toBeGreaterThan(0);
  });

  it("omits the lesson link when the SC has no mapped lesson", () => {
    // 1.2.3 is not covered by any sc-reference lesson in the curriculum.
    const links = linksForSc("1.2.3");
    expect(links.lessonHref).toBeNull();
  });

  it("returns null understanding for an unknown SC number", () => {
    const links = linksForSc("9.9.9");
    expect(links.understanding).toBeNull();
    expect(links.lessonHref).toBeNull();
  });
});
