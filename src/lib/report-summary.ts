import type { AssessmentResult } from "@/components/assessment/types";

export function buildReportSummary(result: AssessmentResult): string {
  const url = result.url ?? "This website";
  const pages = result.pagesScanned;
  const findingCount = result.findings.length;
  const conformance = result.comparison?.conformance;

  let conformancePart = "";
  if (conformance) {
    const fails = conformance.rows.filter((row) => row.result === "Failed");
    if (fails.length > 0) {
      const listed = fails
        .slice(0, 3)
        .map((row) => `${row.num} ${row.title}`)
        .join("; ");
      const more = fails.length > 3 ? `, and ${fails.length - 3} more` : "";
      conformancePart = ` It fails ${fails.length} success ${
        fails.length === 1 ? "criterion" : "criteria"
      } — ${listed}${more}.`;
    } else if (conformance.cannotTell > 0) {
      conformancePart = ` No criteria failed, but ${conformance.cannotTell} cannot be determined and need human review.`;
    } else {
      conformancePart = " No success criteria failed.";
    }
  }

  const outcome = conformance?.outcome;
  const outcomePart =
    outcome === "conforms"
      ? " It conforms to the selected standard."
      : outcome === "does-not-conform"
        ? " It does not conform to the selected standard."
        : " Conformance has not yet been determined.";

  return (
    `Summary: ${url} was assessed across ${pages} ${pages === 1 ? "page" : "pages"} with ` +
    `${findingCount} ${findingCount === 1 ? "finding" : "findings"}.` +
    conformancePart +
    outcomePart +
    " See the findings below for what to fix."
  );
}
