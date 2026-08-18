import { describe, expect, it } from "vitest";
import {
  contrastRatio,
  contrastThreshold,
  isLargeText,
  parseRgbColor,
  relativeLuminance,
} from "@/lib/engine/contrast";

describe("parseRgbColor", () => {
  it("parses rgb and rgba strings", () => {
    expect(parseRgbColor("rgb(255, 255, 255)")).toEqual({ r: 255, g: 255, b: 255, a: 1 });
    expect(parseRgbColor("rgba(0, 0, 0, 0.5)")).toEqual({ r: 0, g: 0, b: 0, a: 0.5 });
    expect(parseRgbColor("rgba(18, 52, 86, 1)")).toEqual({ r: 18, g: 52, b: 86, a: 1 });
  });

  it("returns null for non-rgb colors", () => {
    expect(parseRgbColor("transparent")).toBeNull();
    expect(parseRgbColor("#fff")).toBeNull();
  });
});

describe("relativeLuminance", () => {
  it("computes the WCAG relative luminance", () => {
    expect(relativeLuminance(255, 255, 255)).toBeCloseTo(1, 5);
    expect(relativeLuminance(0, 0, 0)).toBeCloseTo(0, 5);
  });
});

describe("contrastRatio", () => {
  it("is 21:1 for white on black", () => {
    const white = { r: 255, g: 255, b: 255, a: 1 };
    const black = { r: 0, g: 0, b: 0, a: 1 };
    expect(contrastRatio(white, black)).toBeCloseTo(21, 3);
  });

  it("is 1:1 for identical colors", () => {
    const grey = { r: 128, g: 128, b: 128, a: 1 };
    expect(contrastRatio(grey, grey)).toBeCloseTo(1, 5);
  });

  it("is symmetric", () => {
    const a = { r: 118, g: 118, b: 118, a: 1 };
    const b = { r: 255, g: 255, b: 255, a: 1 };
    expect(contrastRatio(a, b)).toBeCloseTo(contrastRatio(b, a), 5);
  });

  it("passes the #767676 on white reference (≈4.54:1)", () => {
    const grey = { r: 118, g: 118, b: 118, a: 1 };
    const white = { r: 255, g: 255, b: 255, a: 1 };
    const ratio = contrastRatio(grey, white);
    expect(ratio).toBeGreaterThan(4.5);
    expect(ratio).toBeLessThan(4.6);
  });
});

describe("isLargeText + contrastThreshold", () => {
  it("treats >=24px or >=18.66px bold as large text", () => {
    expect(isLargeText(24, 400)).toBe(true);
    expect(isLargeText(18.66, 700)).toBe(true);
    expect(isLargeText(18, 700)).toBe(false);
    expect(isLargeText(20, 400)).toBe(false);
  });

  it("uses 3:1 for large text and 4.5:1 otherwise", () => {
    expect(contrastThreshold(true)).toBe(3);
    expect(contrastThreshold(false)).toBe(4.5);
  });
});
