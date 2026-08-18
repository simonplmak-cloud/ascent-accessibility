import { describe, expect, it } from "vitest";
import { scsForStandard } from "@/lib/standards/version";
import type { WcagLevel } from "@/lib/standards/wcag-sc";

const nums = (version: "2.0" | "2.1" | "2.2", level: WcagLevel) =>
  scsForStandard(version, level).map((s) => s.num);

describe("scsForStandard", () => {
  it("includes 4.1.1 Parsing for 2.0 and 2.1 but not 2.2 (AC-1)", () => {
    expect(nums("2.0", "AA")).toContain("4.1.1");
    expect(nums("2.1", "AA")).toContain("4.1.1");
    expect(nums("2.2", "AA")).not.toContain("4.1.1");
  });

  it("includes 2.1 additions only from 2.1 onward (AC-1)", () => {
    expect(nums("2.0", "AA")).not.toContain("1.3.4");
    expect(nums("2.1", "AA")).toContain("1.3.4");
    expect(nums("2.2", "AA")).toContain("1.3.4");
  });

  it("includes 2.2 additions only in 2.2 (AC-1)", () => {
    expect(nums("2.1", "AA")).not.toContain("2.4.11");
    expect(nums("2.2", "AA")).toContain("2.4.11");
    expect(nums("2.2", "AA")).toContain("2.5.8");
    expect(nums("2.2", "A")).toContain("3.3.7");
  });

  it("respects level — AAA SCs appear only in AAA (AC-1)", () => {
    expect(nums("2.2", "AA")).not.toContain("1.4.6");
    expect(nums("2.2", "AAA")).toContain("1.4.6");
  });

  it("each level is a superset of the previous (AC-1)", () => {
    expect(nums("2.2", "A").every((n) => nums("2.2", "AA").includes(n))).toBe(true);
    expect(nums("2.2", "AA").every((n) => nums("2.2", "AAA").includes(n))).toBe(true);
  });

  it("returns an empty set for an unknown version (AC-E1)", () => {
    expect(scsForStandard("2.3" as "2.2", "AA")).toEqual([]);
  });
});
