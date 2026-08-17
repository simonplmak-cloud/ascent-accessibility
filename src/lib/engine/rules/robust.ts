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
    selector: "button",
    check: (el) => {
      const aria = el.getAttribute("aria-label");
      if (aria && aria.trim()) return { result: "pass" };
      if (el.getAttribute("aria-labelledby")) return { result: "pass" };
      if ((el.textContent || "").trim()) return { result: "pass" };
      const title = el.getAttribute("title");
      if (title && title.trim()) return { result: "pass" };
      return { result: "fail", failureSummary: "button has no accessible name" };
    },
  },
  {
    id: "input-button-name",
    description: "Ensures input buttons have discernible text",
    help: "Input buttons must have an accessible name",
    impact: "serious",
    tags: ["wcag2a", "wcag412"],
    wcagSc: ["4.1.2"],
    selector: "input[type='button'], input[type='submit'], input[type='reset']",
    check: (el) => {
      const value = el.getAttribute("value");
      if (value && value.trim()) return { result: "pass" };
      const aria = el.getAttribute("aria-label");
      if (aria && aria.trim()) return { result: "pass" };
      const title = el.getAttribute("title");
      if (title && title.trim()) return { result: "pass" };
      return { result: "fail", failureSummary: "input button has no accessible name" };
    },
  },
  {
    id: "select-name",
    description: "Ensures select elements have an accessible name",
    help: "Select elements must have an accessible name",
    impact: "serious",
    tags: ["wcag2a", "wcag412"],
    wcagSc: ["4.1.2"],
    selector: "select",
    check: (el) => {
      const id = el.getAttribute("id");
      if (id && document.querySelector(`label[for="${id}"]`)) return { result: "pass" };
      if (el.closest("label")) return { result: "pass" };
      const aria = el.getAttribute("aria-label");
      if (aria && aria.trim()) return { result: "pass" };
      const title = el.getAttribute("title");
      if (title && title.trim()) return { result: "pass" };
      return { result: "fail", failureSummary: "select element has no accessible name" };
    },
  },
  {
    id: "frame-title",
    description: "Ensures <iframe> and <frame> elements have a title attribute",
    help: "Frames must have a title",
    impact: "serious",
    tags: ["wcag2a", "wcag412"],
    wcagSc: ["4.1.2"],
    selector: "iframe, frame",
    check: (el) => {
      const title = el.getAttribute("title");
      if (title && title.trim()) return { result: "pass" };
      return { result: "fail", failureSummary: "frame element has no title" };
    },
  },
  {
    id: "aria-roles",
    description: "Ensures all elements with a role attribute use a valid value",
    help: "ARIA roles used must conform to valid values",
    impact: "serious",
    tags: ["wcag2a", "wcag412"],
    wcagSc: ["4.1.2"],
    selector: "[role]",
    check: (el) => {
      const roles = (el.getAttribute("role") || "").split(/\s+/).filter(Boolean);
      for (const role of roles) {
        if (VALID_ROLES.indexOf(role) === -1) {
          return { result: "fail", failureSummary: `invalid ARIA role: "${role}"` };
        }
      }
      return { result: "pass" };
    },
  },
  {
    id: "aria-valid-attr-value",
    description: "Ensures all ARIA attributes have valid values",
    help: "ARIA attributes must have valid values",
    impact: "serious",
    tags: ["wcag2a", "wcag412"],
    wcagSc: ["4.1.2"],
    selector:
      "[aria-checked], [aria-pressed], [aria-expanded], [aria-selected], [aria-hidden], [aria-current], [aria-haspopup], [aria-sort], [aria-required], [aria-invalid], [aria-disabled], [aria-busy], [aria-live]",
    check: (el) => {
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
      for (const attr of Object.keys(valid)) {
        const value = el.getAttribute(attr);
        if (value === null) continue;
        if (valid[attr]!.indexOf(value) === -1) {
          return { result: "fail", failureSummary: `invalid value "${value}" for ${attr}` };
        }
      }
      return { result: "pass" };
    },
  },
  {
    id: "aria-required-attr",
    description: "Ensures elements with ARIA roles have all required attributes",
    help: "ARIA roles must have all required attributes",
    impact: "serious",
    tags: ["wcag2a", "wcag412"],
    wcagSc: ["4.1.2"],
    selector: "[role]",
    check: (el) => {
      const role = (el.getAttribute("role") || "").split(/\s+/)[0] ?? "";
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
      const reqs = required[role];
      if (!reqs) return { result: "pass" };
      for (const attr of reqs) {
        if (el.getAttribute(attr) === null) {
          return { result: "fail", failureSummary: `role "${role}" is missing required attribute ${attr}` };
        }
      }
      return { result: "pass" };
    },
  },
  {
    id: "aria-hidden-focus",
    description: "Ensures aria-hidden elements do not contain focusable elements",
    help: "ARIA-hidden elements must not contain focusable elements",
    impact: "serious",
    tags: ["wcag2a", "wcag412"],
    wcagSc: ["4.1.2"],
    selector: "[aria-hidden='true']",
    check: (el) => {
      const focusable = el.querySelector(
        "a[href], button, input, select, textarea, iframe, [tabindex], [contenteditable='true']",
      );
      if (focusable) {
        return { result: "fail", failureSummary: "aria-hidden element contains a focusable descendant" };
      }
      return { result: "pass" };
    },
  },
  {
    id: "duplicate-id",
    description: "Ensures every id attribute value is unique",
    help: "ID attribute values must be unique",
    impact: "moderate",
    tags: ["wcag2a"],
    wcagSc: [],
    selector: null,
    check: () => {
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
      if (duplicate) {
        return { result: "fail", failureSummary: `duplicate id: "${duplicate}"` };
      }
      return { result: "pass" };
    },
  },
];
