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
  };
}

const rawResult = {
  violations: [
    {
      id: "color-contrast",
      impact: "serious",
      description: "Elements must meet minimum color contrast ratio thresholds",
      nodes: [{}, {}, {}],
    },
    {
      id: "image-alt",
      impact: null,
      description: "Ensures <img> elements have alternate text",
      nodes: [{}],
    },
  ],
  passes: [{ id: "region" }, { id: "landmark" }],
};

describe("mapViolations", () => {
  it("maps impact, description, and node count", () => {
    expect(mapViolations(rawResult)).toEqual([
      {
        id: "color-contrast",
        impact: "serious",
        description: "Elements must meet minimum color contrast ratio thresholds",
        nodeCount: 3,
      },
      {
        id: "image-alt",
        impact: "minor",
        description: "Ensures <img> elements have alternate text",
        nodeCount: 1,
      },
    ]);
  });

  it("normalizes a null impact to minor", () => {
    expect(mapViolations({ violations: [{ id: "x", impact: null, description: "", nodes: [] }], passes: [] })[0]?.impact).toBe("minor");
  });
});

describe("scanPage", () => {
  it("returns mapped violations and pass count", async () => {
    const page = makePage(rawResult);
    const result = await scanPage("https://example.com/", ["wcag2a", "wcag2aa"], page);
    expect(result.url).toBe("https://example.com/");
    expect(result.violations).toHaveLength(2);
    expect(result.passesCount).toBe(2);
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
