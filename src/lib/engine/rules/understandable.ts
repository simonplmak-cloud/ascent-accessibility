import type { Rule } from "../types";

export const understandableRules: Rule[] = [
  {
    id: "html-has-lang",
    description: "Ensures every HTML document has a lang attribute",
    help: "<html> element must have a lang attribute",
    impact: "serious",
    tags: ["wcag2a", "wcag311"],
    wcagSc: ["3.1.1"],
    matcher: "html",
    extract: (el) => ({ lang: el.getAttribute("lang") }),
    checks: [
      {
        id: "lang-present",
        evaluate: (f) =>
          (f.lang as string)?.trim()
            ? { result: "pass" }
            : { result: "fail", failureSummary: "html element has no lang attribute" },
      },
    ],
  },
  {
    id: "html-lang-valid",
    description: "Ensures the lang attribute of the <html> element has a valid value",
    help: "<html> element must have a valid lang value",
    impact: "serious",
    tags: ["wcag2a", "wcag311"],
    wcagSc: ["3.1.1"],
    matcher: "html",
    extract: (el) => ({ lang: el.getAttribute("lang") ?? "" }),
    checks: [
      {
        id: "lang-valid",
        evaluate: (f) =>
          /^[a-zA-Z]{2,3}(-[a-zA-Z0-9]{2,8})*$/.test(f.lang as string)
            ? { result: "pass" }
            : { result: "fail", failureSummary: `invalid lang value: "${f.lang}"` },
      },
    ],
  },
  {
    id: "label",
    description: "Ensures every form element has a label",
    help: "Form elements must have labels",
    impact: "serious",
    tags: ["wcag2a", "wcag332"],
    wcagSc: ["3.3.2"],
    matcher: "input:not([type='hidden']):not([type='submit']):not([type='button']):not([type='reset']), select, textarea",
    extract: (el) => ({
      hasFor: !!(el.getAttribute("id") && document.querySelector(`label[for="${el.getAttribute("id")}"]`)),
      inLabel: !!el.closest("label"),
      aria: el.getAttribute("aria-label"),
      labelledby: el.getAttribute("aria-labelledby")
        ? document.getElementById(el.getAttribute("aria-labelledby")!.trim())
        : null,
      title: el.getAttribute("title"),
    }),
    checks: [
      {
        id: "label-associated",
        evaluate: (f) => {
          if (f.hasFor) return { result: "pass" };
          if (f.inLabel) return { result: "pass" };
          if ((f.aria as string)?.trim()) return { result: "pass" };
          if (f.labelledby) return { result: "pass" };
          if ((f.title as string)?.trim()) return { result: "pass" };
          return { result: "fail", failureSummary: "form element has no label" };
        },
      },
    ],
  },
];
