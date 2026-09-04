import type { ConformanceRow } from "@/components/assessment/types";
import type { ReportReviewClaim, ReportReviewResult } from "./types";

// Builds an Accessibility Conformance Report (ACR) in VPAT structure from the
// per-criterion conformance data. Honest about coverage: an automated draft is
// clearly marked DRAFT / "Not Evaluated" for unresolved criteria; a completed
// human review flips it to a signed claim with the reviewer's identity and the
// evaluation methods they recorded.
//
// The VPAT mapping is exposed as pure helpers so the HTML endpoint and the PDF
// report (which localizes the labels) share one source of truth.

export type VpatLevel =
  | "supports"
  | "partially-supports"
  | "does-not-support"
  | "not-applicable"
  | "not-evaluated";

export type TestedBy = "machine" | "ai" | "human" | "notTested" | "dash";

const VPAT_LABEL_KEYS: Record<VpatLevel, string> = {
  supports: "supports",
  "partially-supports": "partiallySupports",
  "does-not-support": "doesNotSupport",
  "not-applicable": "notApplicable",
  "not-evaluated": "notEvaluated",
};

/** i18n key (acr namespace) for a VPAT conformance level. */
export function vpatLabelKey(level: VpatLevel): string {
  return VPAT_LABEL_KEYS[level];
}

// English labels for the standalone HTML ACR (the PDF localizes via i18n).
const VPAT_EN: Record<VpatLevel, string> = {
  supports: "Supports",
  "partially-supports": "Partially Supports",
  "does-not-support": "Does Not Support",
  "not-applicable": "Not Applicable",
  "not-evaluated": "Not Evaluated",
};

const TESTED_EN: Record<TestedBy, string> = {
  machine: "Machine (automated)",
  ai: "AI-assisted",
  human: "Human review",
  notTested: "Not tested",
  dash: "—",
};

/**
 * VPAT conformance level for a per-criterion row. An unresolved "Not tested"
 * that a human later resolved is mapped to the resolved verdict's level;
 * otherwise it is honestly "not-evaluated" (no AI testing was run). 
 * "partially-supports" is part of the vocabulary but is not auto-mapped — the
 * engine produces binary per-SC verdicts, so a "partial" claim would be fabricated.
 */
export function vpatLevelOf(
  row: ConformanceRow,
  reviewResult?: ReportReviewResult,
): VpatLevel {
  if (row.result === "NotTested" && reviewResult) {
    switch (reviewResult.verdict) {
      case "Passed":
        return "supports";
      case "Failed":
        return "does-not-support";
      case "NotPresent":
        return "not-applicable";
    }
  }
  switch (row.result) {
    case "Passed":
      return "supports";
    case "Failed":
      return "does-not-support";
    case "NotPresent":
      return "not-applicable";
    default:
      return "not-evaluated";
  }
}

/** Which review method resolved (or will resolve) a criterion. */
export function testedByOf(row: ConformanceRow): TestedBy {
  if (row.machineResult === "Passed" || row.machineResult === "Failed") {
    return "machine";
  }
  if (row.result === "NotTested") return "notTested";
  if (row.result === "Passed" || row.result === "Failed") return "ai";
  return "dash";
}

export interface AcrRemarksInput {
  num: string;
  result: string;
  findings: ReadonlyArray<{ wcagSc?: string[]; description: string }>;
  reviewResult?: ReportReviewResult | undefined;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

/** Per-criterion "Remarks" text (VPAT requires an explanation for each result). */
export function acrRemarks(input: AcrRemarksInput): string {
  const { num, result, findings, reviewResult, t } = input;
  const related = findings.filter((f) => (f.wcagSc ?? []).includes(num));
  switch (result) {
    case "Failed": {
      if (related.length === 0) return t("remarkFailedNone");
      const examples = related
        .slice(0, 2)
        .map((f) => f.description)
        .join("; ");
      return t("remarkFailed", { count: related.length, examples });
    }
    case "Passed":
      return t("remarkPassed");
    case "NotPresent":
      return t("remarkNotApplicable");
    case "NotTested":
      return reviewResult
        ? reviewResult.note?.trim()
          ? reviewResult.note
          : t("remarkResolved")
        : t("remarkNotTested");
    default:
      return "";
  }
}

/** Identity of the evaluator: the reviewer when reviewed, otherwise none. */
export function acrIdentity(
  claim: ReportReviewClaim | null | undefined,
  reviewed: boolean,
): { reviewerName: string; organization: string; email: string } {
  if (reviewed) {
    return {
      reviewerName: claim?.reviewerName ?? "",
      organization: claim?.organization ?? "",
      email: claim?.email ?? "",
    };
  }
  return { reviewerName: "", organization: "", email: "" };
}

function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escList(values: string[]): string {
  return values.map((v) => `<li>${esc(v)}</li>`).join("\n");
}

export interface AcrInput {
  url: string;
  standard: string;
  date: string;
  productName: string;
  productVersion: string;
  evaluator: string;
  contact: string;
  evaluationMethods: string[];
  notes: string[];
  reviewed: boolean;
  coverage: number;
  total: number;
  passed: number;
  failed: number;
  notTested: number;
  rows: ConformanceRow[];
  reviewResults?: Record<string, ReportReviewResult> | undefined;
  findings?: ReadonlyArray<{ wcagSc?: string[]; description: string }> | undefined;
}

const EN_REMARKS = (key: string, vars?: Record<string, string | number>): string => {
  switch (key) {
    case "remarkFailed":
      return `${vars?.count ?? 0} finding(s): ${vars?.examples ?? ""}`;
    case "remarkFailedNone":
      return "Does not support the criterion.";
    case "remarkPassed":
      return "No automated violations detected for this criterion.";
    case "remarkNotApplicable":
      return "Not applicable — no relevant content detected.";
    case "remarkNotTested":
      return "Not AI-tested — no AI key configured.";
    case "remarkResolved":
      return "Resolved by human review.";
    default:
      return "";
  }
};

export function buildAcrHtml(input: AcrInput): string {
  const resolved = input.passed + input.failed;
  const findings = input.findings ?? [];
  const reviewResults = input.reviewResults ?? {};

  const rows = input.rows
    .map((row) => {
      const reviewResult = reviewResults[row.num];
      const remarks = acrRemarks({
        num: row.num,
        result: row.result,
        findings,
        reviewResult,
        t: EN_REMARKS,
      });
      return `<tr>
  <td>${esc(row.num)}</td>
  <td>${esc(row.title)}</td>
  <td>${esc(row.level)}</td>
  <td>${esc(VPAT_EN[vpatLevelOf(row, reviewResult)])}</td>
  <td>${esc(remarks)}</td>
  <td>${esc(TESTED_EN[testedByOf(row)])}${row.confidence === "single-source" ? " (single source)" : ""}</td>
</tr>`;
    })
    .join("\n");

  const status = input.reviewed
    ? `<p class="signed">Signed conformance report — human review completed by ${esc(input.evaluator)}.</p>`
    : `<p class="draft">DRAFT — automated scan &middot; partial coverage &middot; not independently verified. This is not a procurement-grade ACR.</p>`;

  const methodItems = input.evaluationMethods.length
    ? `<ul>${escList(input.evaluationMethods)}</ul>`
    : `<p class="meta">Automated rule engine + AI-assisted review. Human review not yet performed.</p>`;

  const noteItems = input.notes.length ? `<ul>${escList(input.notes)}</ul>` : "";

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Accessibility Conformance Report${input.reviewed ? "" : " (Draft)"} — ${esc(input.url)}</title>
<style>
  body { font-family: system-ui, sans-serif; color: #1f2328; max-width: 900px; margin: 2rem auto; padding: 0 1rem; line-height: 1.5; }
  h1 { font-size: 1.5rem; } h2 { font-size: 1.1rem; margin-top: 1.5rem; }
  .draft { border: 2px solid #b3541e; background: #fff7ed; padding: 0.75rem 1rem; border-radius: 4px; font-weight: 600; color: #8a3b00; }
  .signed { border: 2px solid #1a7f37; background: #f0fff4; padding: 0.75rem 1rem; border-radius: 4px; font-weight: 600; color: #1a7f37; }
  table { border-collapse: collapse; width: 100%; margin-top: 1rem; font-size: 0.85rem; }
  th, td { border: 1px solid #d0d7de; padding: 0.4rem 0.6rem; text-align: left; vertical-align: top; }
  th { background: #f6f8fa; }
  dl { display: grid; grid-template-columns: max-content 1fr; gap: 0.25rem 1rem; }
  dt { font-weight: 600; } dd { margin: 0; }
  .meta { color: #57606a; font-size: 0.85rem; }
</style>
</head>
<body>
  <h1>Accessibility Conformance Report (ACR)</h1>
  ${status}

  <h2>Summary</h2>
  <dl>
    <dt>Product / URL</dt><dd>${esc(input.url)}</dd>
    <dt>Product name</dt><dd>${esc(input.productName)}</dd>
    <dt>Product version</dt><dd>${esc(input.productVersion)}</dd>
    <dt>Standard</dt><dd>${esc(input.standard)}</dd>
    <dt>Report date</dt><dd>${esc(input.date)}</dd>
    <dt>Evaluator</dt><dd>${esc(input.evaluator)}</dd>
    <dt>Contact</dt><dd>${esc(input.contact)}</dd>
    <dt>Coverage</dt><dd>${resolved} of ${input.total} criteria resolved (${input.notTested} not AI-tested)</dd>
    <dt>Evaluation methods used</dt><dd>${methodItems}</dd>
    ${input.notes.length ? `<dt>Notes</dt><dd>${noteItems}</dd>` : ""}
  </dl>

  <h2>Results by success criterion</h2>
  <p class="meta">Conformance levels follow the VPAT convention: Supports / Partially Supports / Does Not Support / Not Applicable / Not Evaluated.</p>
  <table>
    <thead>
      <tr><th>SC</th><th>Criterion</th><th>Level</th><th>Conformance</th><th>Remarks</th><th>Tested by</th></tr>
    </thead>
    <tbody>
${rows}
    </tbody>
  </table>

  <p class="meta">Generated by Ascent Accessibility (ascent-partners.com). ${input.reviewed ? "This report reflects a completed human review." : "This draft is generated from automated results only and is not a statement of full WCAG conformance."}</p>
</body>
</html>`;
}
