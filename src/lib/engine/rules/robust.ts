import type { Rule } from "../types";

const VALID_ROLES = [
  "alert", "alertdialog", "application", "article", "banner", "button", "cell",
  "checkbox", "columnheader", "combobox", "complementary", "contentinfo", "definition",
  "dialog", "directory", "document", "feed", "figure", "form", "grid", "gridcell",
  "group", "heading", "img", "link", "list", "listbox", "listitem", "log", "main",
  "marquee", "math", "menu", "menubar", "menuitem", "menuitemcheckbox", "menuitemradio",
  "navigation", "none", "note", "option", "presentation", "progressbar", "radio",
  "radiogroup", "region", "row", "rowgroup", "rowheader", "scrollbar", "search",
  "searchbox", "separator", "slider", "spinbutton", "status", "switch", "tab", "table",
  "tablist", "tabpanel", "term", "textbox", "timer", "toolbar", "tooltip", "tree",
  "treegrid", "treeitem",
];

export const robustRules: Rule[] = [
  {
    id: "button-name",
    description: "Ensures buttons have discernible text",
    help: "Buttons must have an accessible name",
    impact: "serious",
    tags: ["wcag2a", "wcag412"],
    wcagSc: ["4.1.2"],
    matcher: "button",
    extract: (el) => ({
      aria: el.getAttribute("aria-label"),
      labelledby: el.getAttribute("aria-labelledby"),
      text: (el.textContent || "").trim(),
      title: el.getAttribute("title"),
    }),
    checks: [
      {
        id: "button-name",
        evaluate: (f) => {
          if ((f.aria as string)?.trim()) return { result: "pass" };
          if (f.labelledby) return { result: "pass" };
          if (f.text) return { result: "pass" };
          if ((f.title as string)?.trim()) return { result: "pass" };
          return { result: "fail", failureSummary: "button has no accessible name" };
        },
      },
    ],
  },
  {
    id: "input-button-name",
    description: "Ensures input buttons have discernible text",
    help: "Input buttons must have an accessible name",
    impact: "serious",
    tags: ["wcag2a", "wcag412"],
    wcagSc: ["4.1.2"],
    matcher: "input[type='button'], input[type='submit'], input[type='reset']",
    extract: (el) => ({
      value: el.getAttribute("value"),
      aria: el.getAttribute("aria-label"),
      title: el.getAttribute("title"),
    }),
    checks: [
      {
        id: "input-button-name",
        evaluate: (f) => {
          if ((f.value as string)?.trim()) return { result: "pass" };
          if ((f.aria as string)?.trim()) return { result: "pass" };
          if ((f.title as string)?.trim()) return { result: "pass" };
          return { result: "fail", failureSummary: "input button has no accessible name" };
        },
      },
    ],
  },
  {
    id: "select-name",
    description: "Ensures select elements have an accessible name",
    help: "Select elements must have an accessible name",
    impact: "serious",
    tags: ["wcag2a", "wcag412"],
    wcagSc: ["4.1.2"],
    matcher: "select",
    extract: (el) => ({
      hasFor: !!(el.getAttribute("id") && document.querySelector(`label[for="${el.getAttribute("id")}"]`)),
      inLabel: !!el.closest("label"),
      aria: el.getAttribute("aria-label"),
      title: el.getAttribute("title"),
    }),
    checks: [
      {
        id: "select-name",
        evaluate: (f) => {
          if (f.hasFor) return { result: "pass" };
          if (f.inLabel) return { result: "pass" };
          if ((f.aria as string)?.trim()) return { result: "pass" };
          if ((f.title as string)?.trim()) return { result: "pass" };
          return { result: "fail", failureSummary: "select element has no accessible name" };
        },
      },
    ],
  },
  {
    id: "frame-title",
    description: "Ensures <iframe> and <frame> elements have a title attribute",
    help: "Frames must have a title",
    impact: "serious",
    tags: ["wcag2a", "wcag412"],
    wcagSc: ["4.1.2"],
    matcher: "iframe, frame",
    extract: (el) => ({ title: el.getAttribute("title") }),
    checks: [
      {
        id: "frame-title",
        evaluate: (f) =>
          (f.title as string)?.trim()
            ? { result: "pass" }
            : { result: "fail", failureSummary: "frame element has no title" },
      },
    ],
  },
  {
    id: "aria-roles",
    description: "Ensures all elements with a role attribute use a valid value",
    help: "ARIA roles used must conform to valid values",
    impact: "serious",
    tags: ["wcag2a", "wcag412"],
    wcagSc: ["4.1.2"],
    matcher: "[role]",
    extract: (el) => ({ roles: (el.getAttribute("role") ?? "").split(/\s+/).filter(Boolean) }),
    checks: [
      {
        id: "valid-roles",
        evaluate: (f) => {
          for (const role of f.roles as string[]) {
            if (VALID_ROLES.indexOf(role) === -1) {
              return { result: "fail", failureSummary: `invalid ARIA role: "${role}"` };
            }
          }
          return { result: "pass" };
        },
      },
    ],
  },
  {
    id: "aria-valid-attr-value",
    description: "Ensures all ARIA attributes have valid values",
    help: "ARIA attributes must have valid values",
    impact: "serious",
    tags: ["wcag2a", "wcag412"],
    wcagSc: ["4.1.2"],
    matcher:
      "[aria-checked], [aria-pressed], [aria-expanded], [aria-selected], [aria-hidden], [aria-current], [aria-haspopup], [aria-sort], [aria-required], [aria-invalid], [aria-disabled], [aria-busy], [aria-live]",
    extract: (el) => {
      const attrs: Record<string, string> = {};
      for (const a of ["aria-checked", "aria-pressed", "aria-expanded", "aria-selected", "aria-hidden", "aria-current", "aria-haspopup", "aria-sort", "aria-required", "aria-invalid", "aria-disabled", "aria-busy", "aria-live"]) {
        const v = el.getAttribute(a);
        if (v !== null) attrs[a] = v;
      }
      return { attrs };
    },
    checks: [
      {
        id: "valid-attr-values",
        evaluate: (f) => {
          const valid: Record<string, string[]> = {
            "aria-checked": ["true", "false", "mixed"],
            "aria-pressed": ["true", "false", "mixed"],
            "aria-expanded": ["true", "false"],
            "aria-selected": ["true", "false"],
            "aria-hidden": ["true", "false"],
            "aria-current": ["page", "step", "location", "date", "time", "true", "false"],
            "aria-haspopup": ["true", "false", "menu", "listbox", "tree", "grid", "dialog"],
            "aria-sort": ["ascending", "descending", "none", "other"],
            "aria-required": ["true", "false"],
            "aria-invalid": ["true", "false", "grammar", "spelling"],
            "aria-disabled": ["true", "false"],
            "aria-busy": ["true", "false"],
            "aria-live": ["off", "polite", "assertive"],
          };
          for (const [attr, value] of Object.entries(f.attrs as Record<string, string>)) {
            if (valid[attr] && valid[attr]!.indexOf(value) === -1) {
              return { result: "fail", failureSummary: `invalid value "${value}" for ${attr}` };
            }
          }
          return { result: "pass" };
        },
      },
    ],
  },
  {
    id: "aria-required-attr",
    description: "Ensures elements with ARIA roles have all required attributes",
    help: "ARIA roles must have all required attributes",
    impact: "serious",
    tags: ["wcag2a", "wcag412"],
    wcagSc: ["4.1.2"],
    matcher: "[role]",
    extract: (el) => {
      const role = (el.getAttribute("role") ?? "").split(/\s+/)[0] ?? "";
      const attrs: string[] = [];
      for (const a of ["aria-checked", "aria-level", "aria-controls", "aria-valuenow", "aria-selected"]) {
        if (el.getAttribute(a) !== null) attrs.push(a);
      }
      return { role, attrs };
    },
    checks: [
      {
        id: "required-attrs",
        evaluate: (f) => {
          const required: Record<string, string[]> = {
            checkbox: ["aria-checked"],
            heading: ["aria-level"],
            menuitemcheckbox: ["aria-checked"],
            menuitemradio: ["aria-checked"],
            option: ["aria-selected"],
            radio: ["aria-checked"],
            scrollbar: ["aria-controls", "aria-valuenow"],
            slider: ["aria-valuenow"],
            spinbutton: ["aria-valuenow"],
            switch: ["aria-checked"],
          };
          const reqs = required[f.role as string];
          if (!reqs) return { result: "pass" };
          const attrs = f.attrs as string[];
          for (const a of reqs) {
            if (!attrs.includes(a)) {
              return { result: "fail", failureSummary: `role "${f.role}" is missing required attribute ${a}` };
            }
          }
          return { result: "pass" };
        },
      },
    ],
  },
  {
    id: "aria-hidden-focus",
    description: "Ensures aria-hidden elements do not contain focusable elements",
    help: "ARIA-hidden elements must not contain focusable elements",
    impact: "serious",
    tags: ["wcag2a", "wcag412"],
    wcagSc: ["4.1.2"],
    matcher: "[aria-hidden='true']",
    extract: (el) => ({
      hasFocusable: !!el.querySelector(
        "a[href], button, input, select, textarea, iframe, [tabindex], [contenteditable='true']",
      ),
    }),
    checks: [
      {
        id: "aria-hidden-no-focus",
        evaluate: (f) =>
          f.hasFocusable
            ? { result: "fail", failureSummary: "aria-hidden element contains a focusable descendant" }
            : { result: "pass" },
      },
    ],
  },
  {
    id: "duplicate-id",
    description: "Ensures every id attribute value is unique",
    help: "ID attribute values must be unique",
    impact: "moderate",
    tags: ["wcag2a"],
    wcagSc: ["4.1.1"],
    matcher: null,
    extract: () => {
      const seen = new Set<string>();
      let duplicate = "";
      for (const el of Array.from(document.querySelectorAll("[id]"))) {
        const id = el.getAttribute("id");
        if (!id) continue;
        if (seen.has(id)) {
          duplicate = id;
          break;
        }
        seen.add(id);
      }
      return { duplicate };
    },
    checks: [
      {
        id: "unique-ids",
        evaluate: (f) =>
          f.duplicate
            ? { result: "fail", failureSummary: `duplicate id: "${f.duplicate}"` }
            : { result: "pass" },
      },
    ],
  },
];
