import type { Rule } from "../types";

// Deterministic clean-room rules for machine-testable SCs that were previously
// marked `ruleId: "gap"` in nature.ts. Two kinds:
//   - Deterministic (1.4.6, 2.5.5): fail on a measurable violation.
//   - Presence-based (2.4.5, 2.4.8, 2.4.10, 3.3.5, 3.3.7, 2.2.3): pass when the
//     mechanism is present; "incomplete" (→ Cannot tell) on absence — never a
//     speculative failure. Interaction/state SCs stay deferred to the agentic
//     AI review.
export const gapFillRules: Rule[] = [
  {
    id: "contrast-enhanced",
    description: "Ensures the contrast ratio meets WCAG 2 AAA thresholds",
    help: "Text must have enhanced color contrast (7:1, 4.5:1 large)",
    impact: "serious",
    tags: ["wcag2aaa", "wcag146"],
    wcagSc: ["1.4.6"],
    matcher:
      "p, h1, h2, h3, h4, h5, h6, li, a, button, label, td, th, figcaption, blockquote, dt, dd, input[type='text'], input[type='search'], textarea",
    extract: (el) => {
      const parse = (c: string): [number, number, number, number] | null => {
        const m = /rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)/i.exec(c);
        if (!m) return null;
        return [parseFloat(m[1]!), parseFloat(m[2]!), parseFloat(m[3]!), m[4] !== undefined ? parseFloat(m[4]) : 1];
      };
      const text = (el.textContent || "").trim();
      let fg: [number, number, number, number] | null = null;
      let bg: [number, number, number, number] | null = null;
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
        id: "contrast-enhanced-threshold",
        evaluate: (f) => {
          if (!f.text) return { result: "pass" };
          const fg = f.fg as [number, number, number, number] | null;
          const bg = f.bg as [number, number, number, number] | null;
          if (!fg || !bg) return { result: "incomplete", failureSummary: "contrast not computable" };
          const lum = (r: number, g: number, b: number) => {
            const f2 = (v: number) => {
              const s = v / 255;
              return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
            };
            return 0.2126 * f2(r) + 0.7152 * f2(g) + 0.0722 * f2(b);
          };
          const l1 = lum(fg[0], fg[1], fg[2]);
          const l2 = lum(bg[0], bg[1], bg[2]);
          const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
          const size = f.fontSize as number;
          const weight = f.fontWeight as number;
          const isLarge = size >= 24 || (size >= 18.66 && weight >= 700);
          const threshold = isLarge ? 4.5 : 7;
          if (ratio < threshold) {
            return { result: "fail", failureSummary: `contrast ratio ${ratio.toFixed(2)} is below ${threshold}:1` };
          }
          return { result: "pass" };
        },
      },
    ],
  },
  {
    id: "target-size-enhanced",
    description: "Ensures interactive targets meet the 44x44 CSS pixel minimum (AAA)",
    help: "Interactive targets must be at least 44x44 CSS pixels",
    impact: "serious",
    tags: ["wcag21aaa", "wcag255"],
    wcagSc: ["2.5.5"],
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
        id: "target-size-enhanced-minimum",
        evaluate: (f) => {
          const w = f.width as number;
          const h = f.height as number;
          if (w === 0 || h === 0) return { result: "pass" };
          if (f.inline) return { result: "pass" };
          if (w >= 44 && h >= 44) return { result: "pass" };
          return { result: "fail", failureSummary: `target is ${Math.round(w)}x${Math.round(h)}px (below 44x44)` };
        },
      },
    ],
  },
  {
    id: "multiple-ways",
    description: "Ensures the page is reachable by more than one navigation method",
    help: "Pages must be reachable in more than one way",
    impact: "moderate",
    tags: ["wcag2aa", "wcag245"],
    wcagSc: ["2.4.5"],
    matcher: null,
    extract: () => ({
      hasNav: !!document.querySelector("nav a[href], header a[href], footer a[href]"),
      hasSearch: !!document.querySelector("input[type='search'], form[role='search'], [role='search'] input"),
      hasSitemap: !!document.querySelector("a[href*='sitemap' i]"),
      hasBreadcrumb: !!document.querySelector("[aria-label*='breadcrumb' i], nav[aria-label*='breadcrumb' i]"),
    }),
    checks: [
      {
        id: "multiple-ways-present",
        evaluate: (f) => {
          const ways = [f.hasNav, f.hasSearch, f.hasSitemap, f.hasBreadcrumb].filter(Boolean).length;
          return ways >= 2
            ? { result: "pass" }
            : { result: "incomplete", failureSummary: `only ${ways} navigation method(s) detected` };
        },
      },
    ],
  },
  {
    id: "location",
    description: "Ensures the page's location within the site is identifiable",
    help: "The user's location in the site must be identifiable",
    impact: "moderate",
    tags: ["wcag2aaa", "wcag248"],
    wcagSc: ["2.4.8"],
    matcher: null,
    extract: () => ({
      hasBreadcrumb: !!document.querySelector("[aria-label*='breadcrumb' i], nav[aria-label*='breadcrumb' i]"),
      hasCurrent: !!document.querySelector("[aria-current='page'], [aria-current='location'], [aria-current='step']"),
    }),
    checks: [
      {
        id: "location-identifiable",
        evaluate: (f) =>
          f.hasBreadcrumb || f.hasCurrent
            ? { result: "pass" }
            : { result: "incomplete", failureSummary: "no breadcrumb or aria-current location marker found" },
      },
    ],
  },
  {
    id: "section-headings",
    description: "Ensures content sections are organised with headings",
    help: "Sections of content must have headings",
    impact: "moderate",
    tags: ["wcag2aaa", "wcag2410"],
    wcagSc: ["2.4.10"],
    matcher: null,
    extract: () => {
      const sections = Array.from(document.querySelectorAll("section, article, [role='region']"));
      const unlabelled = sections.filter((s) => {
        const hasHeading = !!s.querySelector("h1,h2,h3,h4,h5,h6");
        const hasLabel = s.getAttribute("aria-label") || s.getAttribute("aria-labelledby");
        return !hasHeading && !hasLabel;
      });
      return { sectionCount: sections.length, unlabelledCount: unlabelled.length };
    },
    checks: [
      {
        id: "sections-have-headings",
        evaluate: (f) =>
          (f.sectionCount as number) === 0 || (f.unlabelledCount as number) === 0
            ? { result: "pass" }
            : { result: "incomplete", failureSummary: `${f.unlabelledCount} section(s) have no heading` },
      },
    ],
  },
  {
    id: "help",
    description: "Ensures context-sensitive help is available",
    help: "Context-sensitive help must be available",
    impact: "moderate",
    tags: ["wcag2aaa", "wcag335"],
    wcagSc: ["3.3.5"],
    matcher: null,
    extract: () => ({
      hasHelpLink: !!document.querySelector("a[href*='help' i], a[href*='contact' i], a[href*='support' i], a[href*='assist' i]"),
      hasDescribedBy: !!document.querySelector("[aria-describedby]"),
    }),
    checks: [
      {
        id: "help-available",
        evaluate: (f) =>
          f.hasHelpLink || f.hasDescribedBy
            ? { result: "pass" }
            : { result: "incomplete", failureSummary: "no help/contact link or aria-describedby found" },
      },
    ],
  },
  {
    id: "redundant-entry",
    description: "Ensures form fields use autocomplete to avoid redundant re-entry",
    help: "Repeated information must not be re-entered unnecessarily",
    impact: "moderate",
    tags: ["wcag22aa", "wcag337"],
    wcagSc: ["3.3.7"],
    matcher: "form",
    extract: (el) => {
      const inputs = Array.from(el.querySelectorAll("input, select, textarea"));
      const textInputs = inputs.filter((i) => {
        const t = i.getAttribute("type");
        return t === null || ["text", "email", "tel", "search", "url", "password"].includes(t);
      });
      return {
        textInputCount: textInputs.length,
        autocompleteCount: textInputs.filter((i) => i.getAttribute("autocomplete")).length,
      };
    },
    checks: [
      {
        id: "autocomplete-present",
        evaluate: (f) => {
          if ((f.textInputCount as number) === 0) return { result: "pass" };
          if ((f.autocompleteCount as number) > 0) return { result: "pass" };
          return { result: "incomplete", failureSummary: "form text inputs lack autocomplete attributes" };
        },
      },
    ],
  },
  {
    id: "no-timing",
    description: "Ensures no time limit is imposed (AAA)",
    help: "Timing must not be essential to the content",
    impact: "moderate",
    tags: ["wcag2aaa", "wcag223"],
    wcagSc: ["2.2.3"],
    matcher: null,
    extract: () => ({
      hasMetaRefresh: !!document.querySelector("meta[http-equiv='refresh' i]"),
    }),
    checks: [
      {
        id: "no-meta-refresh",
        evaluate: (f) =>
          f.hasMetaRefresh
            ? { result: "incomplete", failureSummary: "meta refresh present" }
            : { result: "pass" },
      },
    ],
  },
];
