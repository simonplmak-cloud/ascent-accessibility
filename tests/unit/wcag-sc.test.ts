import { describe, expect, it } from "vitest";
import { getSc, scFromTag, scsForTags } from "@/lib/standards/wcag-sc";

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
