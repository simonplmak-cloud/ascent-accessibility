import { describe, expect, it } from "vitest";
import {
  DEFAULT_STANDARD_ID,
  getDefaultStandard,
  getStandard,
  listStandards,
} from "@/lib/standards/catalog";

describe("StandardsCatalog", () => {
  it("lists exactly the seven supported standards", () => {
    const ids = listStandards()
      .map((s) => s.id)
      .sort();
    expect(ids).toEqual(
      [
        "section508",
        "wcag20aa",
        "wcag21a",
        "wcag21aa",
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
    ["wcag22aa", ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]],
    ["wcag22a", ["wcag2a", "wcag21a"]],
    [
      "wcag22aaa",
      ["wcag2a", "wcag2aa", "wcag2aaa", "wcag21a", "wcag21aa", "wcag22aa"],
    ],
    ["wcag21aa", ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]],
    ["wcag21a", ["wcag2a", "wcag21a"]],
    ["wcag20aa", ["wcag2a", "wcag2aa"]],
    ["section508", ["section508"]],
  ])("maps %s to the correct axe-core tags", (id, expectedTags) => {
    const standard = getStandard(id);
    expect(standard).toBeDefined();
    expect(standard?.axeTags).toEqual(expectedTags);
  });

  it("returns undefined for an unknown standard", () => {
    expect(getStandard("wcag30aa")).toBeUndefined();
  });

  it("every axe tag referenced exists in the installed axe-core", async () => {
    const axe = await import("axe-core");
    const knownTags = new Set<string>();
    for (const rule of axe.getRules()) {
      for (const tag of rule.tags) knownTags.add(tag);
    }
    for (const standard of listStandards()) {
      for (const tag of standard.axeTags) {
        expect(knownTags.has(tag), `unknown axe-core tag "${tag}"`).toBe(true);
      }
    }
  });
});
