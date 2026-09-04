import { defineRule, type Rule } from "../types";

// Phase 3 — interaction/behavioral rules that are statically detectable from the
// DOM (keyboard operability, pointer cancellation, dragging alternatives).
export const interactionRules: Rule[] = [
  defineRule({
    id: "click-events-have-key-events",
    description: "Ensures elements with click handlers are keyboard operable",
    help: "Clickable elements must also be keyboard operable",
    impact: "serious",
    tags: ["wcag2a", "wcag211"],
    wcagSc: ["2.1.1"],
    matcher: "[onclick], [role='button'], [role='link'], [role='menuitem'], [role='tab'], [role='option'], [role='switch'], [role='checkbox'], [role='radio'], [role='treeitem'], [role='listbox']",
    extract: (el) => ({
      tag: el.tagName.toLowerCase(),
      href: el.getAttribute("href"),
      tabindex: el.getAttribute("tabindex"),
    }),
    checks: [
      {
        id: "keyboard-operable",
        evaluate: (f) => {
          if (["button", "input", "select", "textarea", "summary"].includes(f.tag)) return { result: "pass" };
          if (f.tag === "a" && f.href) return { result: "pass" };
          if (f.tabindex !== null) return { result: "pass" };
          return { result: "fail", failureSummary: `clickable <${f.tag}> is not keyboard focusable (no tabindex)` };
        },
      },
    ],
  }),
  defineRule({
    id: "pointer-cancellation",
    description: "Ensures actions happen on pointer-up, not pointer-down",
    help: "Functions must be activated on pointer-up or be cancellable",
    impact: "serious",
    tags: ["wcag2a", "wcag252"],
    wcagSc: ["2.5.2"],
    matcher: "[onmousedown], [onpointerdown], [ontouchstart]",
    extract: (el) => ({
      hasUp: !!(
        el.getAttribute("onmouseup") ||
        el.getAttribute("onclick") ||
        el.getAttribute("onpointerup") ||
        el.getAttribute("ontouchend")
      ),
    }),
    checks: [
      {
        id: "up-or-cancellable",
        evaluate: (f) =>
          f.hasUp
            ? { result: "pass" }
            : { result: "fail", failureSummary: "down-event handler without a corresponding up/click handler" },
      },
    ],
  }),
  defineRule({
    id: "dragging-movements",
    description: "Ensures drag actions have a single-pointer alternative",
    help: "Dragging actions must have a single-pointer alternative",
    impact: "serious",
    tags: ["wcag2aa", "wcag257"],
    wcagSc: ["2.5.7"],
    matcher: "[draggable='true']",
    extract: (el) => ({
      hasAlt: !!(
        el.getAttribute("onclick") ||
        el.getAttribute("onkeydown") ||
        el.getAttribute("onkeyup") ||
        el.getAttribute("tabindex") !== null
      ),
    }),
    checks: [
      {
        id: "single-pointer-alternative",
        evaluate: (f) =>
          f.hasAlt
            ? { result: "pass" }
            : { result: "fail", failureSummary: "draggable element without a single-pointer alternative" },
      },
    ],
  }),
];
