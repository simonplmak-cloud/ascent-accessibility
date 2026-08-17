import { describe, expect, it, vi } from "vitest";
import { ALL_RULES, selectRules } from "@/lib/engine/rules";
import { buildEngineSource } from "@/lib/engine/registry";
import { runEngine } from "@/lib/engine/runner";
import type { ScannerPage } from "@/lib/scanner";
import { EMPTY_FEATURES } from "@/lib/standards/sc-applicability";

function makePage(raw: unknown): ScannerPage {
  return {
    goto: vi.fn(async () => ({ status: () => 200 })),
    addInitScript: vi.fn(async () => {}),
    evaluate: vi.fn(async () => raw),
    screenshot: vi.fn(async () => Buffer.alloc(0)),
    screenshotElement: vi.fn(async () => Buffer.alloc(0)),
  };
}

const rawResult = {
  violations: [
    {
      id: "image-alt",
      impact: "serious",
      description: "Images must have alternate text",
      help: "image-alt",
      tags: ["wcag2a", "wcag111"],
      nodes: [{ html: "<img>", target: ["img"], failureSummary: "no alt" }],
    },
  ],
  passes: [{ id: "html-has-lang", tags: ["wcag2a"] }],
  incomplete: [
    {
      id: "button-name",
      tags: ["wcag2a"],
      nodes: [{ html: "<button>", target: ["button"], failureSummary: "name undecidable" }],
    },
  ],
  features: EMPTY_FEATURES,
};

describe("engine rules registry", () => {
  it("ships at least 26 deterministic rules", () => {
    expect(ALL_RULES.length).toBeGreaterThanOrEqual(26);
  });

  it("selects rules by standard tag", () => {
    const selected = selectRules(["wcag2a"]);
    expect(selected.length).toBeGreaterThan(0);
    expect(selected.every((r) => r.tags.includes("wcag2a"))).toBe(true);
  });

  it("builds a self-contained in-page engine source", () => {
    const source = buildEngineSource(ALL_RULES);
    expect(source).toContain("window.__apfEngine");
    expect(source).toContain("image-alt");
    expect(source).toContain("check:");
  });
});

describe("runEngine", () => {
  it("maps raw engine output into a ScanResult (violations/passes/incomplete)", async () => {
    const page = makePage(rawResult);
    const result = await runEngine("https://example.com/", ["wcag2a"], page);
    expect(result.url).toBe("https://example.com/");
    expect(result.violations).toHaveLength(1);
    expect(result.violations[0]).toMatchObject({ id: "image-alt", impact: "serious" });
    expect(result.passes).toHaveLength(1);
    expect(result.incomplete).toHaveLength(1);
    expect(page.evaluate).toHaveBeenCalledWith(expect.any(Function), ["wcag2a"]);
  });

  it("preserves incomplete nodes for AI triage", async () => {
    const page = makePage(rawResult);
    const result = await runEngine("https://example.com/", ["wcag2a"], page);
    expect(result.incomplete[0]?.nodes?.[0]).toMatchObject({
      target: ["button"],
      failureSummary: "name undecidable",
    });
  });

  it("returns an empty result when the page reports no rules", async () => {
    const page = makePage({ violations: [], passes: [], incomplete: [], features: EMPTY_FEATURES });
    const result = await runEngine("https://example.com/", ["wcag2a"], page);
    expect(result.violations).toHaveLength(0);
    expect(result.passes).toHaveLength(0);
  });
});
