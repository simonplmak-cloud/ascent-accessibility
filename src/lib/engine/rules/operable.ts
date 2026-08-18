import type { Rule } from "../types";

export const operableRules: Rule[] = [
  {
    id: "document-title",
    description: "Ensures each HTML document contains a non-empty <title> element",
    help: "Documents must have a title",
    impact: "serious",
    tags: ["wcag2a", "wcag242"],
    wcagSc: ["2.4.2"],
    matcher: null,
    extract: () => ({ title: document.querySelector("title")?.textContent?.trim() ?? "" }),
    checks: [
      {
        id: "title-non-empty",
        evaluate: (f) =>
          f.title
            ? { result: "pass" }
            : { result: "fail", failureSummary: "document has no non-empty title" },
      },
    ],
  },
  {
    id: "link-name",
    description: "Ensures links have discernible text",
    help: "Links must have an accessible name",
    impact: "serious",
    tags: ["wcag2a", "wcag244"],
    wcagSc: ["2.4.4"],
    matcher: "a[href]",
    extract: (el) => ({
      aria: el.getAttribute("aria-label"),
      labelledbyText: el.getAttribute("aria-labelledby")
        ? (document.getElementById(el.getAttribute("aria-labelledby")!.trim())?.textContent ?? "").trim()
        : "",
      text: (el.textContent || "").trim(),
      title: el.getAttribute("title"),
      imgAlt: el.querySelector("img, svg")?.getAttribute("alt") ?? "",
    }),
    checks: [
      {
        id: "link-name",
        evaluate: (f) => {
          if ((f.aria as string)?.trim()) return { result: "pass" };
          if (f.labelledbyText) return { result: "pass" };
          if (f.text) return { result: "pass" };
          if ((f.title as string)?.trim()) return { result: "pass" };
          if ((f.imgAlt as string)?.trim()) return { result: "pass" };
          return { result: "fail", failureSummary: "link has no discernible text" };
        },
      },
    ],
  },
  {
    id: "skip-link",
    description: "Ensures the best-practice mechanism for bypassing blocks is available",
    help: "Page should provide a skip link to main content",
    impact: "moderate",
    tags: ["wcag2a", "wcag241"],
    wcagSc: ["2.4.1"],
    matcher: null,
    extract: () => ({
      hasMain: !!document.querySelector("main, [role='main']"),
      hasSkip: !!document.querySelector("a[href^='#']"),
    }),
    checks: [
      {
        id: "bypass-mechanism",
        evaluate: (f) =>
          f.hasMain || f.hasSkip
            ? { result: "pass" }
            : { result: "fail", failureSummary: "no skip link or main landmark to bypass repeated blocks" },
      },
    ],
  },
  {
    id: "tabindex",
    description: "Ensures tabindex attribute values are not greater than 0",
    help: "Elements should not have tabindex greater than zero",
    impact: "serious",
    tags: ["wcag2a", "wcag243"],
    wcagSc: ["2.4.3"],
    matcher: "[tabindex]",
    extract: (el) => ({ tabindex: parseInt(el.getAttribute("tabindex") || "0", 10) }),
    checks: [
      {
        id: "tabindex-not-positive",
        evaluate: (f) =>
          (f.tabindex as number) > 0
            ? { result: "fail", failureSummary: `tabindex=${f.tabindex} disrupts natural focus order` }
            : { result: "pass" },
      },
    ],
  },
  {
    id: "focus-visible",
    description: "Ensures keyboard focus is visibly indicated",
    help: "Keyboard focus must be visibly indicated",
    impact: "serious",
    tags: ["wcag2aa", "wcag247"],
    wcagSc: ["2.4.7"],
    matcher: null,
    extract: () => {
      let suppressed = false;
      let hasFocusVisibleAlt = false;
      try {
        for (const sheet of Array.from(document.styleSheets)) {
          let rules: CSSRuleList | null;
          try {
            rules = sheet.cssRules;
          } catch {
            continue;
          }
          for (const rule of Array.from(rules ?? [])) {
            const css = rule as CSSStyleRule;
            if (!css.selectorText) continue;
            if (/:focus-visible/.test(css.selectorText)) hasFocusVisibleAlt = true;
            if (/:focus(?![-\w])/.test(css.selectorText)) {
              const outline = css.style?.outline;
              if (outline === "none" || outline === "0") suppressed = true;
            }
          }
        }
        return { suppressed, hasFocusVisibleAlt };
      } catch {
        return { suppressed: null, hasFocusVisibleAlt: null };
      }
    },
    checks: [
      {
        id: "focus-indicator",
        evaluate: (f) => {
          if (f.suppressed === null) return { result: "incomplete", failureSummary: "could not inspect stylesheets" };
          if (f.suppressed && !f.hasFocusVisibleAlt) {
            return { result: "fail", failureSummary: "focus outline suppressed without a :focus-visible alternative" };
          }
          return { result: "pass" };
        },
      },
    ],
  },
];
