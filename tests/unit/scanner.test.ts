import { describe, expect, it, vi } from "vitest";
import {
  mapViolations,
  scanPage,
  ScanFailedError,
  type ScannerPage,
} from "@/lib/scanner";

function makePage(
  raw: unknown,
  opts?: { status?: number; gotoError?: Error },
): ScannerPage {
  return {
    goto: vi.fn(async () => {
      if (opts?.gotoError) throw opts.gotoError;
      return opts?.status !== undefined
        ? { status: () => opts.status! }
        : { status: () => 200 };
    }),
    addInitScript: vi.fn(async () => {}),
    evaluate: vi.fn(async () => raw),
    screenshot: vi.fn(async () => Buffer.alloc(0)),
    screenshotElement: vi.fn(async () => Buffer.alloc(0)),
  };
}

const rawResult = {
  violations: [
    {
      id: "color-contrast",
      impact: "serious",
      description: "Elements must meet minimum color contrast ratio thresholds",
      help: "Color contrast",
      helpUrl: "https://dequeuniversity.com/rules/axe/4.10/color-contrast",
      tags: ["wcag2aa", "wcag143"],
      nodes: [
        { html: "<a>", target: ["a"], failureSummary: "Fix contrast" },
        { html: "<b>", target: ["b"], failureSummary: "Fix contrast" },
        { html: "<c>", target: ["c"], failureSummary: "Fix contrast" },
      ],
    },
    {
      id: "image-alt",
      impact: null,
      description: "Ensures <img> elements have alternate text",
      nodes: [{ html: "<img>", target: ["img"], failureSummary: "" }],
    },
  ],
  passes: [{ id: "region", tags: ["wcag2aa"] }],
  incomplete: [],
};

describe("mapViolations", () => {
  it("maps impact, description, node count, tags, help, and nodes", () => {
    const mapped = mapViolations(rawResult);
    expect(mapped).toHaveLength(2);
    expect(mapped[0]).toMatchObject({
      id: "color-contrast",
      impact: "serious",
      nodeCount: 3,
      tags: ["wcag2aa", "wcag143"],
      help: "Color contrast",
    });
    expect(mapped[0]?.nodes[0]).toMatchObject({ html: "<a>", target: ["a"] });
  });

  it("normalizes a null impact to minor", () => {
    expect(
      mapViolations({
        violations: [{ id: "x", impact: null, description: "", nodes: [] }],
        passes: [],
        incomplete: [],
      })[0]?.impact,
    ).toBe("minor");
  });
});

describe("scanPage", () => {
  it("returns mapped violations, passes, and incomplete", async () => {
    const page = makePage(rawResult);
    const result = await scanPage("https://example.com/", ["wcag2a", "wcag2aa"], page);
    expect(result.url).toBe("https://example.com/");
    expect(result.violations).toHaveLength(2);
    expect(result.passes).toHaveLength(1);
    expect(result.incomplete).toHaveLength(0);
    expect(page.goto).toHaveBeenCalledWith(
      "https://example.com/",
      expect.objectContaining({ timeout: 45000 }),
    );
  });

  it("throws ScanFailedError when navigation fails (AC-E2)", async () => {
    const page = makePage(rawResult, {
      gotoError: new Error("net::ERR_NAME_NOT_RESOLVED"),
    });
    await expect(
      scanPage("https://example.com/", ["wcag2aa"], page),
    ).rejects.toThrow(ScanFailedError);
  });

  it("throws ScanFailedError on HTTP 4xx/5xx (AC-E2)", async () => {
    const page = makePage(rawResult, { status: 404 });
    await expect(
      scanPage("https://example.com/", ["wcag2aa"], page),
    ).rejects.toThrow(/HTTP 404/);
  });
});
