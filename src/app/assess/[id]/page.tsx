import Link from "next/link";
import { assessmentRepository } from "@/db/repository";
import { Report } from "@/components/assessment/report";
import type { AssessmentResult, ComparisonData } from "@/components/assessment/types";

export default async function ShareableReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const assessmentId = decodeURIComponent(id);
  const assessment = await assessmentRepository.findById(assessmentId);
  if (!assessment) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16">
        <h1 className="font-mono text-2xl font-bold text-terminal-fg">
          Assessment not found
        </h1>
        <p className="mt-2 font-mono text-sm text-terminal-muted">
          This report may have been deleted, or the link is incorrect.
        </p>
        <p className="mt-4">
          <Link
            href="/history"
            className="font-mono text-sm text-terminal-fg underline-offset-4 hover:underline"
          >
            Back to history
          </Link>
        </p>
      </div>
    );
  }

  if (assessment.status !== "completed") {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16">
        <h1 className="font-mono text-2xl font-bold text-terminal-fg">
          Assessment {assessment.status}
        </h1>
        <p className="mt-2 font-mono text-sm text-terminal-muted">
          {assessment.status === "queued" &&
            "This assessment is queued and has not started yet."}
          {assessment.status === "running" &&
            "This assessment is currently running. Check back shortly."}
          {assessment.status === "failed" &&
            "This assessment could not be completed."}
        </p>
        <p className="mt-4">
          <Link
            href="/history"
            className="font-mono text-sm text-terminal-fg underline-offset-4 hover:underline"
          >
            Back to history
          </Link>
        </p>
      </div>
    );
  }

  const findings = await assessmentRepository.findFindings(assessmentId);
  const log = await assessmentRepository.readLog(assessmentId);
  const comparison = await assessmentRepository.findComparison<ComparisonData>(assessmentId);

  const result: AssessmentResult = {
    id: assessment.id,
    status: assessment.status,
    partial: assessment.partial,
    url: assessment.url,
    standard: assessment.standard,
    score: assessment.score,
    passBand: assessment.passBand,
    pagesScanned: assessment.pagesScanned,
    log,
    findings: findings as AssessmentResult["findings"],
    comparison: comparison ?? undefined,
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="font-mono text-xl font-bold text-terminal-fg">
        <a
          href={assessment.url}
          className="underline-offset-4 hover:underline"
          target="_blank"
          rel="noreferrer"
        >
          {assessment.url}
        </a>
      </h1>
      <p className="mt-2 font-mono text-sm text-terminal-muted">
        {assessment.standard} · {assessment.depth === 0 ? "Single page" : "Whole website"}
      </p>
      <Report result={result} />
    </div>
  );
}
