import type { Rule } from "../types";

export const understandableRules: Rule[] = [
  {
    id: "html-has-lang",
    description: "Ensures every HTML document has a lang attribute",
    help: "<html> element must have a lang attribute",
    impact: "serious",
    tags: ["wcag2a", "wcag311"],
    wcagSc: ["3.1.1"],
    selector: "html",
    check: (el) => {
      const lang = el.getAttribute("lang");
      if (lang && lang.trim()) return { result: "pass" };
      return { result: "fail", failureSummary: "html element has no lang attribute" };
    },
  },
  {
    id: "html-lang-valid",
    description: "Ensures the lang attribute of the <html> element has a valid value",
    help: "<html> element must have a valid lang value",
    impact: "serious",
    tags: ["wcag2a", "wcag311"],
    wcagSc: ["3.1.1"],
    selector: "html",
    check: (el) => {
      const lang = el.getAttribute("lang") || "";
      if (/^[a-zA-Z]{2,3}(-[a-zA-Z0-9]{2,8})*$/.test(lang)) return { result: "pass" };
      return { result: "fail", failureSummary: `invalid lang value: "${lang}"` };
    },
  },
  {
    id: "label",
    description: "Ensures every form element has a label",
    help: "Form elements must have labels",
    impact: "serious",
    tags: ["wcag2a", "wcag332"],
    wcagSc: ["3.3.2"],
    selector: "input:not([type='hidden']):not([type='submit']):not([type='button']):not([type='reset']), select, textarea",
    check: (el) => {
      const id = el.getAttribute("id");
      if (id && document.querySelector(`label[for="${id}"]`)) return { result: "pass" };
      if (el.closest("label")) return { result: "pass" };
      const aria = el.getAttribute("aria-label");
      if (aria && aria.trim()) return { result: "pass" };
      const labelledby = el.getAttribute("aria-labelledby");
      if (labelledby && document.getElementById(labelledby.trim())) return { result: "pass" };
      const title = el.getAttribute("title");
      if (title && title.trim()) return { result: "pass" };
      return { result: "fail", failureSummary: "form element has no label" };
    },
  },
];
