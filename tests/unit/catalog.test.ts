import { describe, expect, it } from "vitest";
import {
  DEFAULT_STANDARD_ID,
  getDefaultStandard,
  getStandard,
  listStandards,
} from "@/lib/standards/catalog";

describe("StandardsCatalog", () => {
  it("lists exactly the ten supported standards", () => {
    const ids = listStandards()
      .map((s) => s.id)
      .sort();
    expect(ids).toEqual(
      [
        "section508",
        "wcag20a",
        "wcag20aa",
        "wcag20aaa",
        "wcag21a",
        "wcag21aa",
        "wcag21aaa",
        "wcag22a",
        "wcag22aa",
        "wcag22aaa",
      ].sort(),
    );
  });

  it("has unique standard ids", () => {
    const standards = listStandards();
    const ids = standards.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("defaults to WCAG 2.2 AA", () => {
    expect(DEFAULT_STANDARD_ID).toBe("wcag22aa");
    expect(getDefaultStandard().id).toBe("wcag22aa");
  });

  it.each<[string, string[]]>([
    ["wcag22aa", ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22a", "wcag22aa"]],
    ["wcag22a", ["wcag2a", "wcag21a", "wcag22a"]],
    [
      "wcag22aaa",
      ["wcag2a", "wcag2aa", "wcag2aaa", "wcag21a", "wcag21aa", "wcag22a", "wcag22aa"],
    ],
    ["wcag21aa", ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]],
    ["wcag21a", ["wcag2a", "wcag21a"]],
    ["wcag20aa", ["wcag2a", "wcag2aa"]],
    ["section508", ["wcag2a", "wcag2aa"]],
  ])("maps %s to the correct rule tags", (id, expectedTags) => {
    const standard = getStandard(id);
    expect(standard).toBeDefined();
    expect(standard?.tags).toEqual(expectedTags);
  });

  it("returns undefined for an unknown standard", () => {
    expect(getStandard("wcag30aa")).toBeUndefined();
  });
});
