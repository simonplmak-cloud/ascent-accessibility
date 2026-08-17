import type { Rule } from "../types";

export const operableRules: Rule[] = [
  {
    id: "document-title",
    description: "Ensures each HTML document contains a non-empty <title> element",
    help: "Documents must have a title",
    impact: "serious",
    tags: ["wcag2a", "wcag242"],
    wcagSc: ["2.4.2"],
    selector: null,
    check: () => {
      const title = document.querySelector("title");
      if (title && (title.textContent || "").trim()) return { result: "pass" };
      return { result: "fail", failureSummary: "document has no non-empty title" };
    },
  },
  {
    id: "link-name",
    description: "Ensures links have discernible text",
    help: "Links must have an accessible name",
    impact: "serious",
    tags: ["wcag2a", "wcag244"],
    wcagSc: ["2.4.4"],
    selector: "a[href]",
    check: (el) => {
      const aria = el.getAttribute("aria-label");
      if (aria && aria.trim()) return { result: "pass" };
      const labelledby = el.getAttribute("aria-labelledby");
      if (labelledby && document.getElementById(labelledby.trim())) return { result: "pass" };
      if ((el.textContent || "").trim()) return { result: "pass" };
      const title = el.getAttribute("title");
      if (title && title.trim()) return { result: "pass" };
      const img = el.querySelector("img, svg");
      if (img && img.getAttribute("alt") && img.getAttribute("alt")!.trim()) {
        return { result: "pass" };
      }
      return { result: "fail", failureSummary: "link has no discernible text" };
    },
  },
  {
    id: "skip-link",
    description: "Ensures the best-practice mechanism for bypassing blocks is available",
    help: "Page should provide a skip link to main content",
    impact: "moderate",
    tags: ["wcag2a", "wcag241"],
    wcagSc: ["2.4.1"],
    selector: null,
    check: () => {
      const landmark = document.querySelector("main, [role='main']");
      const skip = document.querySelector("a[href^='#']");
      if (!landmark && !skip) {
        return { result: "fail", failureSummary: "no skip link or main landmark to bypass repeated blocks" };
      }
      return { result: "pass" };
    },
  },
  {
    id: "tabindex",
    description: "Ensures tabindex attribute values are not greater than 0",
    help: "Elements should not have tabindex greater than zero",
    impact: "serious",
    tags: ["wcag2a", "wcag243"],
    wcagSc: ["2.4.3"],
    selector: "[tabindex]",
    check: (el) => {
      const value = parseInt(el.getAttribute("tabindex") || "0", 10);
      if (value > 0) {
        return { result: "fail", failureSummary: `tabindex=${value} disrupts natural focus order` };
      }
      return { result: "pass" };
    },
  },
];
