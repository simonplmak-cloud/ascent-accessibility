import type { Impact } from "@/lib/scoring";

export type CheckResult = "pass" | "fail" | "incomplete";

export interface CheckOutcome {
  result: CheckResult;
  failureSummary?: string;
}

// Facts extracted from the DOM for a matched element. Checks operate on these
// facts (pure), never on the live DOM, so they are independently testable.
export type Facts = Record<string, unknown>;

// A single atomic assertion over extracted facts. `evaluate` uses method syntax
// so the parameter is bivariant — this lets a `defineRule`-typed check flow into
// the loose `Rule` shape used by the registry.
export interface Check {
  id: string;
  evaluate(facts: Facts): CheckOutcome;
}

// A rule = matcher + in-page fact extraction + one or more atomic checks.
export interface Rule {
  id: string;
  description: string;
  help: string;
  impact: Impact;
  tags: string[];
  wcagSc: string[];
  matcher: string | null;
  extract: (el: Element) => Facts;
  checks: Check[];
}

// Typed rule builder: infers the facts type F from `extract` and requires every
// check to read exactly F, so a fact-key typo in a check is a compile error.
// Returns the loose `Rule` so heterogeneous rule arrays stay `Rule[]`.
export function defineRule<F extends Facts>(rule: {
  id: string;
  description: string;
  help: string;
  impact: Impact;
  tags: string[];
  wcagSc: string[];
  matcher: string | null;
  extract: (el: Element) => F;
  checks: { id: string; evaluate(facts: F): CheckOutcome }[];
}): Rule {
  return rule;
}
