import { describe, expect, it } from "vitest";
import { analyzeCrossPage, type PageStructure } from "@/lib/assessment/cross-page";

function page(partial: Partial<PageStructure>): PageStructure {
  return {
    url: "https://example.com/",
    navLabels: [],
    headerText: "",
    footerText: "",
    linkPairs: [],
    hasSearch: false,
    hasBreadcrumb: false,
    hasHelpLink: false,
    hasSitemapLink: false,
    formFieldLabels: [],
    ...partial,
  };
}

describe("analyzeCrossPage", () => {
  it("passes 2.4.5 when a multi-page site has nav + search (two ways)", () => {
    const result = analyzeCrossPage([
      page({ url: "/a", navLabels: ["Home", "About"], hasSearch: true }),
      page({ url: "/b", navLabels: ["Home", "About"] }),
    ]);
    expect(result.passes).toContain("2.4.5");
  });

  it("fails 2.4.5 when a multi-page site has only one way (nav only)", () => {
    const result = analyzeCrossPage([
      page({ url: "/a", navLabels: ["Home", "About"] }),
      page({ url: "/b", navLabels: ["Home", "About"] }),
    ]);
    expect(result.findings.some((f) => f.ruleId === "cross-multiple-ways")).toBe(true);
  });

  it("passes 2.4.5 for a single-page site (trivially locatable)", () => {
    const result = analyzeCrossPage([page({ url: "/" })]);
    expect(result.passes).toContain("2.4.5");
    expect(result.passes).toContain("3.2.3");
    expect(result.passes).toContain("3.2.4");
  });

  it("passes 3.2.3 when navigation is consistent and fails when it differs", () => {
    const consistent = analyzeCrossPage([
      page({ url: "/a", navLabels: ["Home", "About"] }),
      page({ url: "/b", navLabels: ["Home", "About"] }),
    ]);
    expect(consistent.passes).toContain("3.2.3");

    const inconsistent = analyzeCrossPage([
      page({ url: "/a", navLabels: ["Home", "About"] }),
      page({ url: "/b", navLabels: ["Home", "Services"] }),
    ]);
    expect(inconsistent.findings.some((f) => f.ruleId === "cross-consistent-nav")).toBe(true);
  });

  it("passes 3.2.4 when the same target is always named the same", () => {
    const consistent = analyzeCrossPage([
      page({ url: "/a", linkPairs: [{ href: "/contact", label: "Contact" }] }),
      page({ url: "/b", linkPairs: [{ href: "/contact", label: "Contact" }] }),
    ]);
    expect(consistent.passes).toContain("3.2.4");

    const inconsistent = analyzeCrossPage([
      page({ url: "/a", linkPairs: [{ href: "/contact", label: "Contact" }] }),
      page({ url: "/b", linkPairs: [{ href: "/contact", label: "Get in touch" }] }),
    ]);
    expect(inconsistent.findings.some((f) => f.ruleId === "cross-consistent-identification")).toBe(true);
  });

  it("passes 2.4.8 / 3.3.5 only when the mechanism is present on most pages", () => {
    const result = analyzeCrossPage([
      page({ url: "/a", hasBreadcrumb: true, hasHelpLink: true }),
      page({ url: "/b", hasBreadcrumb: true, hasHelpLink: true }),
    ]);
    expect(result.passes).toContain("2.4.8");
    expect(result.passes).toContain("3.3.5");
  });
});
