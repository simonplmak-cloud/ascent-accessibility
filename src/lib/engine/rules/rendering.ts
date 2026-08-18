import type { Rule } from "../types";

export const renderingRules: Rule[] = [
  {
    id: "color-contrast",
    description: "Ensures the contrast between foreground and background colors meets WCAG 2 AA thresholds",
    help: "Text must have sufficient color contrast",
    impact: "serious",
    tags: ["wcag2aa", "wcag143"],
    wcagSc: ["1.4.3"],
    selector:
      "p, h1, h2, h3, h4, h5, h6, li, a, button, label, td, th, figcaption, blockquote, dt, dd, input[type='text'], input[type='search'], textarea",
    check: (el) => {
      if (!(el.textContent || "").trim()) return { result: "pass" };

      const parse = (c: string): [number, number, number, number] | null => {
        const m = /rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)/i.exec(c);
        if (!m) return null;
        return [parseFloat(m[1]!), parseFloat(m[2]!), parseFloat(m[3]!), m[4] !== undefined ? parseFloat(m[4]) : 1];
      };
      const luminance = (r: number, g: number, b: number) => {
        const f = (v: number) => {
          const s = v / 255;
          return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
        };
        return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
      };
      const ratio = (fg: [number, number, number, number], bg: [number, number, number, number]) => {
        const l1 = luminance(fg[0], fg[1], fg[2]);
        const l2 = luminance(bg[0], bg[1], bg[2]);
        const hi = l1 >= l2 ? l1 : l2;
        const lo = l1 >= l2 ? l2 : l1;
        return (hi + 0.05) / (lo + 0.05);
      };

      const fg = parse(getComputedStyle(el).color);
      if (!fg) return { result: "incomplete", failureSummary: "foreground color not computable" };

      let bg: [number, number, number, number] | null = null;
      let node: Element | null = el;
      while (node) {
        const c = parse(getComputedStyle(node).backgroundColor);
        if (c && c[3] > 0) {
          bg = c;
          break;
        }
        node = node.parentElement;
      }
      if (!bg) return { result: "incomplete", failureSummary: "background color not computable" };

      const cs = getComputedStyle(el);
      const size = parseFloat(cs.fontSize || "0");
      const weight = parseInt(cs.fontWeight || "400", 10);
      const isLarge = size >= 24 || (size >= 18.66 && weight >= 700);
      const threshold = isLarge ? 3 : 4.5;
      const r = ratio(fg, bg);

      if (r < threshold) {
        return { result: "fail", failureSummary: `contrast ratio ${r.toFixed(2)} is below ${threshold}:1` };
      }
      return { result: "pass" };
    },
  },
  {
    id: "target-size",
    description: "Ensures interactive targets meet the 24x24 CSS pixel minimum",
    help: "Interactive targets must be at least 24x24 CSS pixels",
    impact: "serious",
    tags: ["wcag22aa", "wcag258"],
    wcagSc: ["2.5.8"],
    selector: "button, [role='button'], a[href], input:not([type='hidden']), select, textarea",
    check: (el) => {
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return { result: "pass" };
      if (rect.width >= 24 && rect.height >= 24) return { result: "pass" };
      return {
        result: "fail",
        failureSummary: `target is ${Math.round(rect.width)}x${Math.round(rect.height)}px (below 24x24)`,
      };
    },
  },
  {
    id: "meta-refresh",
    description: "Ensures <meta http-equiv=refresh> does not auto-redirect or refresh too quickly",
    help: "Timed refresh must not be used",
    impact: "serious",
    tags: ["wcag2a", "wcag221"],
    wcagSc: ["2.2.1"],
    selector: "meta[http-equiv='refresh' i]",
    check: (el) => {
      const content = el.getAttribute("content") || "";
      const parts = content.split(";");
      const delay = parseFloat(parts[0]?.trim() || "0");
      const hasUrl = parts.some((p) => /url\s*=/i.test(p));
      if (hasUrl) return { result: "fail", failureSummary: "meta refresh redirects to another page" };
      if (!Number.isNaN(delay) && delay < 72000) {
        return { result: "fail", failureSummary: `meta refresh delays only ${delay}s (below 20h)` };
      }
      return { result: "pass" };
    },
  },
  {
    id: "non-text-contrast",
    description: "Ensures UI component boundaries meet the 3:1 contrast minimum",
    help: "UI component borders and indicators must have 3:1 contrast",
    impact: "serious",
    tags: ["wcag2aa", "wcag1411"],
    wcagSc: ["1.4.11"],
    selector: "input:not([type='hidden']), select, textarea, button",
    check: (el) => {
      const cs = getComputedStyle(el);
      const borderStyle = cs.borderTopStyle;
      if (borderStyle === "none" || borderStyle === "hidden") return { result: "pass" };
      const width = parseFloat(cs.borderTopWidth);
      if (width <= 0) return { result: "pass" };

      const parse = (c: string): [number, number, number, number] | null => {
        const m = /rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)/i.exec(c);
        if (!m) return null;
        return [parseFloat(m[1]!), parseFloat(m[2]!), parseFloat(m[3]!), m[4] !== undefined ? parseFloat(m[4]) : 1];
      };
      const luminance = (r: number, g: number, b: number) => {
        const f = (v: number) => {
          const s = v / 255;
          return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
        };
        return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
      };

      const border = parse(cs.borderTopColor);
      const bg = parse(cs.backgroundColor);
      if (!border || !bg) return { result: "incomplete", failureSummary: "border or background color not computable" };
      if (bg[3] === 0) return { result: "incomplete", failureSummary: "transparent background — contrast undecidable" };

      const l1 = luminance(border[0], border[1], border[2]);
      const l2 = luminance(bg[0], bg[1], bg[2]);
      const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);

      if (ratio < 3) {
        return { result: "fail", failureSummary: `component boundary contrast ${ratio.toFixed(2)} is below 3:1` };
      }
      return { result: "pass" };
    },
  },
];
