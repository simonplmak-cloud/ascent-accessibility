// Transparent three-way results (machine / AI / not-tested) + a combined result.
// Pure, deterministic derivations from the conformance rows + AI verdicts — the
// same logic drives both the web UI report and the PDF report.

export interface MethodRow {
  num: string;
  title: string;
  level: string;
  result: string;
  machineResult?: string;
}

export interface AiVerdict {
  sc: string;
  verdict: string;
  confidence: number;
  reasoning: string;
}

// Machine review: SCs the rule engine decided (a substantive pass/fail verdict).
// "NotPresent" (no relevant content) and "Unresolved" (couldn't decide) are not
// substantive machine verdicts — the former is counted in the combined summary,
// the latter is where the agentic AI review takes over.
export function machineResults(rows: MethodRow[]): {
  passed: number;
  failed: number;
  rows: MethodRow[];
} {
  const decided = rows.filter(
    (r) => r.machineResult === "Passed" || r.machineResult === "Failed",
  );
  return {
    passed: decided.filter((r) => r.machineResult === "Passed").length,
    failed: decided.filter((r) => r.machineResult === "Failed").length,
    rows: decided,
  };
}

// AI-assisted review: what the AI concluded per SC it attempted (pass/fail/
// not-tested + confidence + reasoning). "NotTested" means the AI could not run
// (e.g. no key configured) rather than an ambiguous verdict.
export function aiResults(verdicts: AiVerdict[]): {
  passed: number;
  failed: number;
  notTested: number;
  verdicts: AiVerdict[];
} {
  return {
    passed: verdicts.filter((v) => v.verdict === "Passed").length,
    failed: verdicts.filter((v) => v.verdict === "Failed").length,
    notTested: verdicts.filter((v) => v.verdict === "NotTested").length,
    verdicts,
  };
}

// Not-tested: SCs neither the machine nor the agentic AI resolved (no AI key).
export function notTestedRows(rows: MethodRow[]): {
  count: number;
  rows: MethodRow[];
} {
  const untested = rows.filter((r) => r.result === "NotTested");
  return { count: untested.length, rows: untested };
}

// Combined result: the merged outcome across all methods.
export function combinedSummary(conformance: {
  total: number;
  passed: number;
  failed: number;
  notPresent: number;
  notTested: number;
  coverage: number;
  levelAttained: string;
  outcome: string;
}): {
  total: number;
  passed: number;
  failed: number;
  notPresent: number;
  notTested: number;
  coverage: number;
  levelAttained: string;
  outcome: string;
} {
  return { ...conformance };
}
