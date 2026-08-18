import type { Impact } from "@/lib/scoring";

export type CheckResult = "pass" | "fail" | "incomplete";

export interface CheckOutcome {
  result: CheckResult;
  failureSummary?: string;
}

// Facts extracted from the DOM for a matched element. Checks operate on these
// facts (pure), never on the live DOM, so they are independently testable.
export type Facts = Record<string, unknown>;

// A single atomic assertion over extracted facts.
export interface Check {
  id: string;
  evaluate: (facts: Facts) => CheckOutcome;
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
