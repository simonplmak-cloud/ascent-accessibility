import type { Rule } from "../types";

// Phase 3 — interaction/behavioral rules that are statically detectable from the
// DOM (keyboard operability, pointer cancellation, dragging alternatives).
export const interactionRules: Rule[] = [
  {
    id: "click-events-have-key-events",
    description: "Ensures elements with click handlers are keyboard operable",
    help: "Clickable elements must also be keyboard operable",
    impact: "serious",
    tags: ["wcag2a", "wcag211"],
    wcagSc: ["2.1.1"],
    selector: "[onclick], [role='button'], [role='link'], [role='menuitem'], [role='tab'], [role='option'], [role='switch'], [role='checkbox'], [role='radio'], [role='treeitem'], [role='listbox']",
    check: (el) => {
      const tag = el.tagName.toLowerCase();
      const native = ["button", "input", "select", "textarea", "summary"].includes(tag);
      if (native) return { result: "pass" };
      if (tag === "a" && el.getAttribute("href")) return { result: "pass" };
      if (el.getAttribute("tabindex") !== null) return { result: "pass" };
      return {
        result: "fail",
        failureSummary: `clickable <${tag}> is not keyboard focusable (no tabindex)`,
      };
    },
  },
  {
    id: "pointer-cancellation",
    description: "Ensures actions happen on pointer-up, not pointer-down",
    help: "Functions must be activated on pointer-up or be cancellable",
    impact: "serious",
    tags: ["wcag2a", "wcag252"],
    wcagSc: ["2.5.2"],
    selector: "[onmousedown], [onpointerdown], [ontouchstart]",
    check: (el) => {
      const hasUp =
        el.getAttribute("onmouseup") ||
        el.getAttribute("onclick") ||
        el.getAttribute("onpointerup") ||
        el.getAttribute("ontouchend");
      if (hasUp) return { result: "pass" };
      return {
        result: "fail",
        failureSummary: "down-event handler without a corresponding up/click handler",
      };
    },
  },
  {
    id: "dragging-movements",
    description: "Ensures drag actions have a single-pointer alternative",
    help: "Dragging actions must have a single-pointer alternative",
    impact: "serious",
    tags: ["wcag2aa", "wcag257"],
    wcagSc: ["2.5.7"],
    selector: "[draggable='true']",
    check: (el) => {
      const alt =
        el.getAttribute("onclick") ||
        el.getAttribute("onkeydown") ||
        el.getAttribute("onkeyup") ||
        el.getAttribute("tabindex") !== null;
      if (alt) return { result: "pass" };
      return {
        result: "fail",
        failureSummary: "draggable element without a single-pointer alternative",
      };
    },
  },
];
