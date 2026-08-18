import { describe, expect, it } from "vitest";
import { generateVpat, vpatLevel } from "@/lib/export/vpat";

describe("vpatLevel (verdict → VPAT conformance level)", () => {
  it("maps verdicts to VPAT 2.4 levels (AC-14)", () => {
    expect(vpatLevel("Passed")).toBe("Supports");
    expect(vpatLevel("Failed")).toBe("Does Not Support");
    expect(vpatLevel("NotPresent")).toBe("Not Applicable");
    expect(vpatLevel("CannotTell")).toBe("Not Evaluated");
    expect(vpatLevel("NotChecked")).toBe("Not Evaluated");
  });

  it("fails safe to Not Evaluated for unknown verdicts", () => {
    expect(vpatLevel("garbage")).toBe("Not Evaluated");
  });
});

describe("generateVpat", () => {
  it("marks the document complete when all criteria are resolved", () => {
    const doc = generateVpat({
      edition: "wcag",
      rows: [
        { criterion: "1.1.1", title: "Non-text Content", verdict: "Passed" },
        { criterion: "1.4.3", title: "Contrast (Minimum)", verdict: "Failed" },
        { criterion: "1.2.1", title: "Audio-only and Video-only", verdict: "NotPresent" },
      ],
    });
    expect(doc.complete).toBe(true);
    expect(doc.edition).toBe("wcag");
    expect(doc.criteria.map((c) => c.conformanceLevel)).toEqual([
      "Supports",
      "Does Not Support",
      "Not Applicable",
    ]);
  });

  it("marks the document incomplete on an unreviewed criterion (AC-E4)", () => {
    const doc = generateVpat({
      edition: "eu",
      rows: [{ criterion: "1.1.1", verdict: "CannotTell" }],
    });
    expect(doc.complete).toBe(false);
    expect(doc.criteria[0]?.conformanceLevel).toBe("Not Evaluated");
  });

  it("uses the edition-specific title", () => {
    expect(generateVpat({ edition: "508", rows: [] }).title).toContain("Section 508");
    expect(generateVpat({ edition: "eu", rows: [] }).title).toContain("EN 301 549");
  });
});
