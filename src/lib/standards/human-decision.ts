// The "decision-point contract" for AI-assisted human review. Every success
// criterion the AI cannot resolve maps to a `whyNotAi` category (why a machine
// can't decide — yet), a concrete `humanDecisionPoint` (the exact question the
// reviewer answers), and — per the "no permanently human" principle — a
// `pathToAi` naming the enhancement that would move the category into AI-review.
//
// `HUMAN_DECISION_SCS` is a *snapshot* of the residual human set after the AI
// enhancement phase; it is expected to shrink over time, never to grow
// permanently. `RECLASSIFIED_SCS` is the migration record of SCs that already
// left human review.

export type HumanDecisionCategory =
  | "interaction"
  | "temporal"
  | "dynamic-state"
  | "multipage"
  | "editorial"
  | "domain";

export interface HumanDecisionCategoryDef {
  /** Why the AI cannot decide this category (yet). */
  whyNotAi: string;
  /** The future enhancement that would move this category into AI-review. */
  pathToAi: string;
}

export interface HumanDecisionSc {
  category: HumanDecisionCategory;
  /** The exact question the reviewer answers (English canonical). */
  humanDecisionPoint: string;
}

export const HUMAN_DECISION_CATEGORIES: Record<HumanDecisionCategory, HumanDecisionCategoryDef> = {
  interaction: {
    whyNotAi:
      "Synthetic events in one browser can't reproduce a real user's keyboard/gesture/motion/shortcut input, nor a screen reader's actual announcement order.",
    pathToAi: "Deeper browser/AT automation (real keyboard/gesture emulation, screen-reader output capture).",
  },
  temporal: {
    whyNotAi:
      "The agent evaluates a static snapshot; it can't sit through a session (timeout/interruption) or measure the ≤3 Hz flash threshold.",
    pathToAi: "Session simulation + timed observation + flash-frequency analysis.",
  },
  "dynamic-state": {
    whyNotAi:
      "The crawl can't reliably force every invalid submission, so the error/status state may never exist to evidence.",
    pathToAi: "Full form automation (enumerate + drive every invalid path).",
  },
  multipage: {
    whyNotAi: "Scoring is per-page today; cross-page comparison isn't wired.",
    pathToAi: "Multi-page AI context (crawl-wide evidence in the tool loop).",
  },
  editorial: {
    whyNotAi:
      '"Meaningful / clear / plain / appropriate reading level" is audience-relative; a wrong PASS is worse than a flag.',
    pathToAi: "Calibrated language-model judgment with audience context.",
  },
  domain: {
    whyNotAi:
      '"Substantial legal/financial commitment" / "cognitive function test" requires the site owner\'s domain knowledge.',
    pathToAi: "Domain-aware classification config (owner-declared flow intent).",
  },
};

// Residual SCs a human must still decide after the AI-enhancement phase,
// keyed by SC number. This is a snapshot, not a permanent division.
export const HUMAN_DECISION_SCS: Record<string, HumanDecisionSc> = {
  "1.1.1": {
    category: "editorial",
    humanDecisionPoint:
      "Is the alternative text a faithful, meaningful description of each image's content/function, with a longer description where needed?",
  },
  "1.2.8": {
    category: "editorial",
    humanDecisionPoint: "Does the text alternative present equivalent information to the prerecorded media?",
  },
  "1.3.1": {
    category: "interaction",
    humanDecisionPoint: "Does a screen reader announce the relationships/structure correctly?",
  },
  "1.4.8": {
    category: "editorial",
    humanDecisionPoint: "Do the visual-presentation controls meet the required thresholds?",
  },
  "2.1.3": {
    category: "interaction",
    humanDecisionPoint: "Can the entire content be operated from the keyboard alone, with no exception?",
  },
  "2.1.4": {
    category: "interaction",
    humanDecisionPoint: "Do single-character shortcuts meet the turn-off/remap/active-only rule?",
  },
  "2.2.4": {
    category: "temporal",
    humanDecisionPoint: "Can interruptions be postponed or suppressed by the user?",
  },
  "2.2.5": {
    category: "temporal",
    humanDecisionPoint: "Is entered data preserved when re-authenticating after a session expiry?",
  },
  "2.2.6": {
    category: "temporal",
    humanDecisionPoint: "Is the timeout essential, or does the user get a warning/extension?",
  },
  "2.3.1": {
    category: "temporal",
    humanDecisionPoint: "Does anything flash more than three times per second?",
  },
  "2.3.2": {
    category: "temporal",
    humanDecisionPoint: "Does anything flash more than three times per second?",
  },
  "2.5.1": {
    category: "interaction",
    humanDecisionPoint: "Is a single-pointer alternative available for every path-based gesture?",
  },
  "2.5.4": {
    category: "interaction",
    humanDecisionPoint: "Is motion actuation non-essential, or is an alternative provided / can it be disabled?",
  },
  "2.5.6": {
    category: "interaction",
    humanDecisionPoint: "Can the user use concurrent input mechanisms (e.g. touch + keyboard)?",
  },
  "3.1.5": {
    category: "editorial",
    humanDecisionPoint:
      "Is the prose at an appropriate reading level for the audience (or is a plain-language version provided)?",
  },
  "3.1.6": {
    category: "editorial",
    humanDecisionPoint: "Where pronunciation affects meaning, is a mechanism provided?",
  },
  "3.2.3": {
    category: "multipage",
    humanDecisionPoint: "Is the navigation order/position consistent across pages?",
  },
  "3.2.4": {
    category: "multipage",
    humanDecisionPoint: "Are components with the same function identified consistently across pages?",
  },
  "3.2.5": {
    category: "interaction",
    humanDecisionPoint: "Is a change of context initiated only on user request, or can it be turned off?",
  },
  "3.3.4": {
    category: "domain",
    humanDecisionPoint:
      "Does this flow involve a legal/financial/data commitment requiring reversible, checked, confirmed submission?",
  },
  "3.3.6": {
    category: "domain",
    humanDecisionPoint:
      "Does this flow involve a legal/financial/data commitment requiring reversible, checked, confirmed submission?",
  },
  "3.3.8": {
    category: "domain",
    humanDecisionPoint: "Does the login use a cognitive-function test? Is an alternative or object-recognition method present?",
  },
  "3.3.9": {
    category: "domain",
    humanDecisionPoint: "Does the login use a cognitive-function test? Is an alternative or object-recognition method present?",
  },
  "4.1.2": {
    category: "interaction",
    humanDecisionPoint: "Does a screen reader announce the name/role/value correctly?",
  },
  "4.1.3": {
    category: "dynamic-state",
    humanDecisionPoint: "When dynamic content changes, is a status/alert/live region present?",
  },
};

// SCs that left human review in the AI-enhancement phase (migration record).
export const RECLASSIFIED_SCS: readonly string[] = ["3.2.1", "3.2.2"];

export function humanDecisionFor(sc: string): HumanDecisionSc | undefined {
  return HUMAN_DECISION_SCS[sc];
}
