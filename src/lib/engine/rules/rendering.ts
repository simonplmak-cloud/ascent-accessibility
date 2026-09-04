import { defineRule, type Rule } from "../types";

type Rgba = [number, number, number, number];

export const renderingRules: Rule[] = [
  defineRule({
    id: "color-contrast",
    description: "Ensures the contrast between foreground and background colors meets WCAG 2 AA thresholds",
    help: "Text must have sufficient color contrast",
    impact: "serious",
    tags: ["wcag2aa", "wcag143"],
    wcagSc: ["1.4.3"],
    matcher:
      "p, h1, h2, h3, h4, h5, h6, li, a, button, label, td, th, figcaption, blockquote, dt, dd, input[type='text'], input[type='search'], textarea",
    extract: (el) => {
      const parse = (c: string): Rgba | null => {
        const m = /rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)/i.exec(c);
        if (!m) return null;
        return [parseFloat(m[1]!), parseFloat(m[2]!), parseFloat(m[3]!), m[4] !== undefined ? parseFloat(m[4]) : 1];
      };
      const text = (el.textContent || "").trim();
      let fg: Rgba | null = null;
      let bg: Rgba | null = null;
      let fontSize = 0;
      let fontWeight = 400;
      if (text) {
        const cs = getComputedStyle(el);
        fg = parse(cs.color);
        fontSize = parseFloat(cs.fontSize || "0");
        fontWeight = parseInt(cs.fontWeight || "400", 10);
        let node: Element | null = el;
        while (node) {
          const c = parse(getComputedStyle(node).backgroundColor);
          if (c && c[3] > 0) {
            bg = c;
            break;
          }
          node = node.parentElement;
        }
      }
      return { text, fg, bg, fontSize, fontWeight };
    },
    checks: [
      {
        id: "contrast-minimum",
        evaluate: (f) => {
          if (!f.text) return { result: "pass" };
          if (!f.fg) return { result: "incomplete", failureSummary: "foreground color not computable" };
          if (!f.bg) return { result: "incomplete", failureSummary: "background color not computable" };
          const lum = (r: number, g: number, b: number) => {
            const lf = (v: number) => {
              const s = v / 255;
              return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
            };
            return 0.2126 * lf(r) + 0.7152 * lf(g) + 0.0722 * lf(b);
          };
          const l1 = lum(f.fg[0], f.fg[1], f.fg[2]);
          const l2 = lum(f.bg[0], f.bg[1], f.bg[2]);
          const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
          const isLarge = f.fontSize >= 24 || (f.fontSize >= 18.66 && f.fontWeight >= 700);
          const threshold = isLarge ? 3 : 4.5;
          if (ratio < threshold) {
            return { result: "fail", failureSummary: `contrast ratio ${ratio.toFixed(2)} is below ${threshold}:1` };
          }
          return { result: "pass" };
        },
      },
    ],
  }),
  defineRule({
    id: "target-size",
    description: "Ensures interactive targets meet the 24x24 CSS pixel minimum",
    help: "Interactive targets must be at least 24x24 CSS pixels",
    impact: "serious",
    tags: ["wcag22aa", "wcag258"],
    wcagSc: ["2.5.8"],
    matcher: "button, [role='button'], a[href], input:not([type='hidden']), select, textarea",
    extract: (el) => {
      const rect = el.getBoundingClientRect();
      let inline = false;
      if (el.tagName === "A") {
        const parent = el.parentElement;
        if (parent) {
          const own = (el.textContent || "").trim().length;
          const parentText = (parent.textContent || "").trim().length;
          const display = typeof getComputedStyle === "function" ? getComputedStyle(el).display : "";
          inline = display === "inline" && parentText > own + 2;
        }
      }
      return { width: rect.width, height: rect.height, inline };
    },
    checks: [
      {
        id: "target-size-minimum",
        evaluate: (f) => {
          if (f.width === 0 || f.height === 0) return { result: "pass" };
          if (f.inline) return { result: "pass" };
          if (f.width >= 24 && f.height >= 24) return { result: "pass" };
          return { result: "fail", failureSummary: `target is ${Math.round(f.width)}x${Math.round(f.height)}px (below 24x24)` };
        },
      },
    ],
  }),
  defineRule({
    id: "meta-refresh",
    description: "Ensures <meta http-equiv=refresh> does not auto-redirect or refresh too quickly",
    help: "Timed refresh must not be used",
    impact: "serious",
    tags: ["wcag2a", "wcag221"],
    wcagSc: ["2.2.1"],
    matcher: "meta[http-equiv='refresh' i]",
    extract: (el) => ({ content: el.getAttribute("content") ?? "" }),
    checks: [
      {
        id: "refresh-timing",
        evaluate: (f) => {
          const parts = f.content.split(";");
          const delay = parseFloat(parts[0]?.trim() || "0");
          const hasUrl = parts.some((p) => /url\s*=/i.test(p));
          if (hasUrl) return { result: "fail", failureSummary: "meta refresh redirects to another page" };
          if (!Number.isNaN(delay) && delay < 72000) {
            return { result: "fail", failureSummary: `meta refresh delays only ${delay}s (below 20h)` };
          }
          return { result: "pass" };
        },
      },
    ],
  }),
  defineRule({
    id: "non-text-contrast",
    description: "Ensures UI component boundaries meet the 3:1 contrast minimum",
    help: "UI component borders and indicators must have 3:1 contrast",
    impact: "serious",
    tags: ["wcag2aa", "wcag1411"],
    wcagSc: ["1.4.11"],
    matcher: "input:not([type='hidden']), select, textarea, button",
    extract: (el) => {
      const cs = getComputedStyle(el);
      const parse = (c: string): Rgba | null => {
        const m = /rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)/i.exec(c);
        if (!m) return null;
        return [parseFloat(m[1]!), parseFloat(m[2]!), parseFloat(m[3]!), m[4] !== undefined ? parseFloat(m[4]) : 1];
      };
      const borderStyle = cs.borderTopStyle;
      const width = parseFloat(cs.borderTopWidth);
      const border = parse(cs.borderTopColor);
      const bg = parse(cs.backgroundColor);
      return { borderStyle, width, border, bg };
    },
    checks: [
      {
        id: "boundary-contrast",
        evaluate: (f) => {
          if (f.borderStyle === "none" || f.borderStyle === "hidden") return { result: "pass" };
          if (f.width <= 0) return { result: "pass" };
          if (!f.border || !f.bg) return { result: "incomplete", failureSummary: "border or background color not computable" };
          if (f.bg[3] === 0) return { result: "incomplete", failureSummary: "transparent background — contrast undecidable" };
          const lum = (r: number, g: number, b: number) => {
            const lf = (v: number) => {
              const s = v / 255;
              return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
            };
            return 0.2126 * lf(r) + 0.7152 * lf(g) + 0.0722 * lf(b);
          };
          const l1 = lum(f.border[0], f.border[1], f.border[2]);
          const l2 = lum(f.bg[0], f.bg[1], f.bg[2]);
          const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
          if (ratio < 3) {
            return { result: "fail", failureSummary: `component boundary contrast ${ratio.toFixed(2)} is below 3:1` };
          }
          return { result: "pass" };
        },
      },
    ],
  }),
];
