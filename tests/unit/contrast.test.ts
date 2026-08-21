import { describe, expect, it } from "vitest";

// Relative luminance + WCAG contrast ratio (WCAG 2.x).
function luminance(hex: string): number {
  const c = hex.replace("#", "");
  const channel = (i: number) => {
    const v = parseInt(c.substring(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(0) + 0.7152 * channel(2) + 0.0722 * channel(4);
}

function ratio(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

// These values must stay in sync with src/app/globals.css. The test is the gate
// that stops a brand token from ever shipping below AAA (AC-A4-1).
const DARK_BG = "#0b0f14";
const LIGHT_BG = "#ffffff";

const dark = { fg: "#e6edf3", muted: "#9da7b0", brand: "#3fb9dd", brandLink: "#5ec8e8", accent: "#dfb947" };
const light = { fg: "#1f2328", muted: "#595f6e", brand: "#006987", brandLink: "#00566f", accent: "#8a6d00" };

describe("AAA contrast (AC-A4-1)", () => {
  it("body text meets 7:1 in both themes", () => {
    expect(ratio(dark.fg, DARK_BG)).toBeGreaterThanOrEqual(7);
    expect(ratio(light.fg, LIGHT_BG)).toBeGreaterThanOrEqual(7);
  });

  it("brand links meet 7:1 (body/small) in both themes", () => {
    expect(ratio(dark.brandLink, DARK_BG)).toBeGreaterThanOrEqual(7);
    expect(ratio(light.brandLink, LIGHT_BG)).toBeGreaterThanOrEqual(7);
  });

  it("brand headings meet 4.5:1 (large) in both themes", () => {
    expect(ratio(dark.brand, DARK_BG)).toBeGreaterThanOrEqual(4.5);
    expect(ratio(light.brand, LIGHT_BG)).toBeGreaterThanOrEqual(4.5);
  });

  it("accent meets 4.5:1 (large) in both themes", () => {
    expect(ratio(dark.accent, DARK_BG)).toBeGreaterThanOrEqual(4.5);
    expect(ratio(light.accent, LIGHT_BG)).toBeGreaterThanOrEqual(4.5);
  });

  it("muted text meets 4.5:1 in both themes", () => {
    expect(ratio(dark.muted, DARK_BG)).toBeGreaterThanOrEqual(4.5);
    expect(ratio(light.muted, LIGHT_BG)).toBeGreaterThanOrEqual(4.5);
  });
});
