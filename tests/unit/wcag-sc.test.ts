import { describe, expect, it } from "vitest";
import {
  getSc,
  scFromTag,
  scsForTags,
  WCAG_GUIDELINES,
  WCAG_SCS,
  guidelineName,
  guidelineOf,
  guidelinePrinciple,
} from "@/lib/standards/wcag-sc";

describe("scFromTag", () => {
  it("maps wcagNNN tags to SC numbers", () => {
    expect(scFromTag("wcag143")).toBe("1.4.3");
    expect(scFromTag("wcag111")).toBe("1.1.1");
    expect(scFromTag("wcag2411")).toBe("2.4.11");
    expect(scFromTag("wcag257")).toBe("2.5.7");
  });

  it("returns null for non-SC tags", () => {
    expect(scFromTag("wcag2aa")).toBeNull();
    expect(scFromTag("best-practice")).toBeNull();
    expect(scFromTag("cat.color")).toBeNull();
  });
});

describe("scsForTags", () => {
  it("collects unique SC numbers from rule tags", () => {
    expect(scsForTags(["wcag2aa", "wcag143", "cat.color"])).toEqual(["1.4.3"]);
  });
});

describe("getSc", () => {
  it("returns SC metadata", () => {
    expect(getSc("1.4.3")).toMatchObject({ num: "1.4.3", level: "AA" });
    expect(getSc("4.1.1")).toMatchObject({ num: "4.1.1", introducedIn: "2.0", removedIn: "2.2" });
  });
});

describe("guidelines (reference taxonomy)", () => {
  it("defines 13 guidelines across the 4 principles", () => {
    expect(WCAG_GUIDELINES).toHaveLength(13);
    expect(new Set(WCAG_GUIDELINES.map((g) => guidelinePrinciple(g.num)))).toEqual(
      new Set([1, 2, 3, 4]),
    );
  });

  it("maps every success criterion to a known guideline", () => {
    const known = new Set(WCAG_GUIDELINES.map((g) => g.num));
    for (const sc of WCAG_SCS) {
      expect(known.has(guidelineOf(sc.num))).toBe(true);
    }
  });

  it("resolves guideline numbers to titles", () => {
    expect(guidelineName("1.1")).toBe("Text Alternatives");
    expect(guidelineName("2.4")).toBe("Navigable");
    expect(guidelineName("4.1")).toBe("Compatible");
  });
});
