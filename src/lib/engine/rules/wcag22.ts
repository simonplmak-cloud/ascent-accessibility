import { defineRule, type Rule } from "../types";

// WCAG 2.2 additions that previously had no machine rule. All three are
// conservative/presence-based: they pass on a clear signal or absence of the
// trigger, and escalate to "incomplete" (→ Cannot tell / AI / human) rather than
// guessing. 2.4.11 and 3.3.8 are Non-Interference SCs (WCAG 2.2 §5.2.5).
export const wcag22Rules: Rule[] = [
  defineRule({
    id: "focus-not-obscured",
    description: "Ensures keyboard focus is not entirely hidden by sticky or fixed overlays",
    help: "When a component receives keyboard focus it must not be entirely hidden by author-created content",
    impact: "serious",
    tags: ["wcag22aa", "wcag2411"],
    wcagSc: ["2.4.11"],
    matcher: null,
    extract: () => {
      const candidates = Array.from(
        document.querySelectorAll(
          "header, footer, nav, div, aside, section, [role='banner'], [role='contentinfo'], [role='dialog']",
        ),
      );
      let obscuring = 0;
      for (const el of candidates) {
        const cs = getComputedStyle(el);
        if (cs.position === "fixed" || cs.position === "sticky") {
          const rect = el.getBoundingClientRect();
          if (rect.height > 24 && rect.width > 0) obscuring++;
        }
      }
      return { obscuring };
    },
    checks: [
      {
        id: "no-obscuring-overlay",
        evaluate: (f) =>
          f.obscuring === 0
            ? { result: "pass" }
            : { result: "incomplete", failureSummary: `${f.obscuring} fixed/sticky overlay(s) may obscure focus` },
      },
    ],
  }),
  defineRule({
    id: "consistent-help",
    description: "Ensures a help mechanism is present on the page",
    help: "Help mechanisms must be provided in a consistent location across a set of pages",
    impact: "moderate",
    tags: ["wcag22a", "wcag326"],
    wcagSc: ["3.2.6"],
    matcher: null,
    extract: () => ({
      hasHelp: !!document.querySelector(
        "a[href*='help' i], a[href*='contact' i], a[href*='support' i], a[href*='faq' i], [role='button'][aria-label*='help' i]",
      ),
    }),
    checks: [
      {
        id: "help-mechanism-present",
        evaluate: (f) =>
          f.hasHelp
            ? { result: "pass" }
            : { result: "incomplete", failureSummary: "no help/contact/support link found" },
      },
    ],
  }),
  defineRule({
    id: "accessible-authentication",
    description: "Ensures authentication does not rely on a cognitive function test alone",
    help: "Authentication must not require a cognitive function test without an alternative mechanism",
    impact: "serious",
    tags: ["wcag22aa", "wcag338"],
    wcagSc: ["3.3.8"],
    matcher: null,
    extract: () => ({
      hasAuth: !!document.querySelector(
        "input[type='password'], form[action*='login' i], form[action*='signin' i], [autocomplete='current-password'], [autocomplete='new-password']",
      ),
    }),
    checks: [
      {
        id: "no-cognitive-auth-test",
        evaluate: (f) =>
          f.hasAuth
            ? { result: "incomplete", failureSummary: "authentication form present — a non-cognitive alternative cannot be verified" }
            : { result: "pass" },
      },
    ],
  }),
];
