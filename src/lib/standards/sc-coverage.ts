import { getSc } from "@/lib/standards/wcag-sc";
import {
  checkScApplicability,
  type Applicability,
  type PageFeatures,
} from "@/lib/standards/sc-applicability";
import { ALL_RULES } from "@/lib/engine/rules";

// WCAG 2.2 §5.2.5 Non-Interference: these SCs "apply to all content on the
// page", so they can never be "not applicable" (absence of a trigger is
// "satisfied", not "not present").
export const ALWAYS_APPLICABLE: ReadonlySet<string> = new Set([
  "1.4.2", // Audio Control
  "2.1.2", // No Keyboard Trap
  "2.2.2", // Pause, Stop, Hide
  "2.3.1", // Three Flashes or Below Threshold
]);

// SCs tested by the worker-side interaction scan (reflow + keyboard trap),
// which live outside the in-page rule engine's `wcagSc` list.
const INTERACTION_SCS: ReadonlySet<string> = new Set(["1.4.10", "2.1.2"]);

// SCs with at least one machine rule. Derived from the actual rule set (single
// source of truth) plus the interaction-scan SCs.
export const MACHINE_SCS: ReadonlySet<string> = new Set([
  ...ALL_RULES.flatMap((rule) => rule.wcagSc),
  ...INTERACTION_SCS,
]);

// Machine SCs whose matcher is a complete enumeration of the SC's content type:
// no match ⇒ the content is genuinely absent ⇒ "not applicable". Every other
// machine SC defaults to partial coverage (no match ⇒ Cannot tell, never a
// false "not present").
export const MATCHER_EXHAUSTIVE: ReadonlySet<string> = new Set([
  "1.2.1", // Audio-only / Video-only (Prerecorded) — matcher audio, video
  "1.2.2", // Captions (Prerecorded) — matcher video
  "2.4.4", // Link Purpose (In Context) — matcher a[href]
  "3.3.2", // Labels or Instructions — matcher input/select/textarea
  "3.3.7", // Redundant Entry — matcher form
]);

// Machine SCs whose rule matcher targets the FIX rather than the content (e.g.
// 1.3.5's `input[autocomplete]`), so matcher-derived applicability would be
// wrong. Route these back through the feature flags.
export const FEATURE_ROUTED_SCS: ReadonlySet<string> = new Set(["1.3.5"]);

// Whether an SC applies to the page. Matcher-derived where the SC has a machine
// rule whose matcher reflects content presence; feature-flag fallback otherwise.
export function isScApplicable(
  sc: string,
  matchedScs: ReadonlySet<string>,
  features: PageFeatures,
): Applicability {
  if (ALWAYS_APPLICABLE.has(sc)) return "applicable";
  if (FEATURE_ROUTED_SCS.has(sc)) return checkScApplicability(sc, features);
  if (MATCHER_EXHAUSTIVE.has(sc)) {
    return matchedScs.has(sc) ? "applicable" : "not-applicable";
  }
  if (MACHINE_SCS.has(sc)) return "applicable"; // partial → Cannot tell on absence
  return checkScApplicability(sc, features);
}

// Whitelist an SC string from untrusted in-page output against the catalog.
export function isValidSc(sc: string): boolean {
  return getSc(sc) !== undefined;
}
