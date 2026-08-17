import type { Impact } from "@/lib/scoring";

export type CheckOutcome =
  | { result: "pass" }
  | { result: "fail"; failureSummary: string }
  | { result: "incomplete"; failureSummary?: string };

export interface Rule {
  id: string;
  description: string;
  help: string;
  impact: Impact;
  tags: string[];
  wcagSc: string[];
  selector: string | null;
  check: (el: Element) => CheckOutcome;
}
