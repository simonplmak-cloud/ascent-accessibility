import { describe, expect, it } from "vitest";
import { WCAG_SCS } from "@/lib/standards/wcag-sc";
import { understandingFor, understandingHref } from "@/lib/standards/understanding";
import { standardName } from "@/lib/standards/standards-locales";
import { listStandards } from "@/lib/standards/catalog";
import { scReviewer, reviewableScs } from "@/lib/standards/sc-reviewers";

describe("understanding", () => {
  it("returns localized content for a principle-1 SC", () => {
    const zh = understandingFor("1.1.1", "zh-Hans");
    expect(zh?.normative).toContain("非文本内容");
    expect(zh?.intent).toBeTruthy();
    const tw = understandingFor("1.1.1", "zh-Hant");
    expect(tw?.normative).toContain("非文字內容");
  });

  it("covers every SC in both zh locales", () => {
    for (const sc of WCAG_SCS) {
      expect(understandingFor(sc.num, "zh-Hans"), `zh-Hans missing ${sc.num}`).toBeTruthy();
      expect(understandingFor(sc.num, "zh-Hant"), `zh-Hant missing ${sc.num}`).toBeTruthy();
    }
  });

  it("flags 2.2-only SCs as unofficial (when authored)", () => {
    const official = understandingFor("1.4.3", "zh-Hans");
    expect(official?.source).toBe("official");
  });

  it("understandingHref points to our page for zh, W3C for en", () => {
    expect(understandingHref("1.4.3", "zh-Hans")).toBe("/understanding/1.4.3");
    expect(understandingHref("1.4.3", "en")).toContain("w3.org");
    expect(understandingHref("1.4.3", undefined)).toContain("w3.org");
  });
});

describe("standardName", () => {
  it("returns fully-Chinese names for every catalog standard", () => {
    for (const s of listStandards()) {
      const zh = standardName(s.id, "zh-Hans");
      expect(zh).toContain("（");
      expect(zh).toContain("）");
    }
  });

  it("uses the English term in parentheses", () => {
    expect(standardName("wcag22aa", "zh-Hans")).toBe("网页内容无障碍指南 2.2 AA（WCAG 2.2 AA）");
    expect(standardName("section508", "zh-Hans")).toContain("Section 508");
    expect(standardName("wcag22aa", "en")).toBe("wcag22aa");
  });
});

describe("sc-reviewers", () => {
  it("maps manual-only SCs to a certified reviewer profile + why, in all locales", () => {
    for (const locale of ["en", "zh-Hans", "zh-Hant"]) {
      const r = scReviewer("3.3.1", locale); // not a manual-only SC -> undefined
      expect(r).toBeUndefined();
      const c = scReviewer("2.1.3", locale);
      expect(c).toBeTruthy();
      expect(c!.profile).toBeTruthy();
      expect(c!.why).toBeTruthy();
    }
    expect(reviewableScs("zh-Hans").length).toBeGreaterThan(15);
  });
});
