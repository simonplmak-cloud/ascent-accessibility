import { describe, expect, it } from "vitest";
import { getSc, scFromAxeTag, scsForTags } from "@/lib/standards/wcag-sc";

describe("scFromAxeTag", () => {
  it("maps wcagNNN tags to SC numbers", () => {
    expect(scFromAxeTag("wcag143")).toBe("1.4.3");
    expect(scFromAxeTag("wcag111")).toBe("1.1.1");
    expect(scFromAxeTag("wcag2411")).toBe("2.4.11");
    expect(scFromAxeTag("wcag257")).toBe("2.5.7");
  });

  it("returns null for non-SC tags", () => {
    expect(scFromAxeTag("wcag2aa")).toBeNull();
    expect(scFromAxeTag("best-practice")).toBeNull();
    expect(scFromAxeTag("cat.color")).toBeNull();
  });
});

describe("scsForTags", () => {
  it("collects unique SC numbers from axe tags", () => {
    expect(scsForTags(["wcag2aa", "wcag143", "cat.color"])).toEqual(["1.4.3"]);
  });
});

describe("getSc", () => {
  it("returns SC metadata", () => {
    expect(getSc("1.4.3")).toMatchObject({ num: "1.4.3", level: "AA" });
    expect(getSc("4.1.1")).toBeUndefined();
  });
});
