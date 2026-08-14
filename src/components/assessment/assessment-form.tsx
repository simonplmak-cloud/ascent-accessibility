"use client";

import { useState } from "react";

interface StandardOption {
  id: string;
  name: string;
}

interface Finding {
  ruleId: string;
  impact: string;
  description: string;
  pageUrl: string;
  elementCount: number;
  recommendation: string;
}

interface AssessmentResult {
  id: string;
  status: string;
  partial: boolean;
  score: number | null;
  passBand: string | null;
  pagesScanned: number;
  findings: Finding[];
}

const MAX_POLLS = 120;

export function AssessmentForm({ standards }: { standards: StandardOption[] }) {
  const [url, setUrl] = useState("");
  const [standard, setStandard] = useState("wcag22aa");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AssessmentResult | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);

    try {
      const createRes = await fetch("/api/v1/assessments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, standard }),
      });
      const createData = await createRes.json();

      if (!createRes.ok) {
        setError(messageForCode(createData.code));
        setLoading(false);
        return;
      }

      await poll(createData.id, 0);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  async function poll(id: string, attempt: number) {
    if (attempt >= MAX_POLLS) {
      setError("The assessment took too long. Please try again.");
      setLoading(false);
      return;
    }
    const res = await fetch(`/api/v1/assessments/${id}`);
    const data = await res.json();
    if (data.status === "completed" || data.status === "failed") {
      setResult(data);
      setLoading(false);
      return;
    }
    setTimeout(() => poll(id, attempt + 1), 2000);
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="url" className="block text-sm font-medium">
            Website URL
          </label>
          <input
            id="url"
            type="url"
            required
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2"
          />
        </div>
        <div>
          <label htmlFor="standard" className="block text-sm font-medium">
            Standard
          </label>
          <select
            id="standard"
            value={standard}
            onChange={(e) => setStandard(e.target.value)}
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2"
          >
            {standards.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-neutral-900 px-6 py-2 text-white hover:bg-neutral-700 disabled:opacity-50"
        >
          {loading ? "Assessing…" : "Run assessment"}
        </button>
      </form>

      {error && (
        <p role="alert" className="mt-4 text-sm text-red-700">
          {error}
        </p>
      )}

      {loading && !result && (
        <p aria-live="polite" className="mt-4 text-sm text-neutral-600">
          Assessment in progress — this may take up to a minute.
        </p>
      )}

      {result?.status === "failed" && (
        <p role="alert" className="mt-4 text-sm text-red-700">
          The assessment could not be completed. Please verify the URL is reachable and try
          again.
        </p>
      )}

      {result?.status === "completed" && <Report result={result} />}
    </div>
  );
}

function messageForCode(code: string): string {
  switch (code) {
    case "SSRF_BLOCKED":
      return "That URL is not publicly accessible.";
    case "RATE_LIMITED":
      return "Too many requests. Please wait a moment and try again.";
    default:
      return "Please enter a valid website URL.";
  }
}

function Report({ result }: { result: AssessmentResult }) {
  return (
    <section className="mt-10" aria-labelledby="report-heading">
      <h2 id="report-heading" className="text-xl font-semibold">
        Assessment report
      </h2>

      <div className="mt-4 flex items-center gap-6">
        <div>
          <p className="text-sm text-neutral-600">Score</p>
          <p className="text-4xl font-bold">{result.score} / 100</p>
        </div>
        <div>
          <p className="text-sm text-neutral-600">Result</p>
          <p className="text-lg font-semibold capitalize">{result.passBand}</p>
        </div>
        <div>
          <p className="text-sm text-neutral-600">Pages scanned</p>
          <p className="text-lg font-semibold">{result.pagesScanned}</p>
        </div>
      </div>

      {result.partial && (
        <p className="mt-4 text-sm text-amber-700">
          Note: this report covers a subset of pages (crawl limits reached).
        </p>
      )}

      <div className="mt-6 flex gap-3">
        <a
          href={`/api/v1/assessments/${result.id}/export?format=pdf`}
          className="rounded-md border border-neutral-300 px-4 py-2 text-sm hover:bg-neutral-100"
        >
          Download PDF
        </a>
        <a
          href={`/api/v1/assessments/${result.id}/export?format=csv`}
          className="rounded-md border border-neutral-300 px-4 py-2 text-sm hover:bg-neutral-100"
        >
          Download CSV
        </a>
      </div>

      <h3 className="mt-8 text-lg font-semibold">
        Findings ({result.findings.length})
      </h3>
      {result.findings.length === 0 ? (
        <p className="mt-2 text-neutral-600">No issues found. Great job!</p>
      ) : (
        <ul className="mt-4 space-y-4">
          {result.findings.map((finding, index) => (
            <li key={`${finding.ruleId}-${index}`} className="rounded-md border border-neutral-200 p-4">
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm">{finding.ruleId}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    finding.impact === "critical"
                      ? "bg-red-100 text-red-800"
                      : finding.impact === "serious"
                        ? "bg-orange-100 text-orange-800"
                        : "bg-neutral-100 text-neutral-700"
                  }`}
                >
                  {finding.impact}
                </span>
                <span className="text-xs text-neutral-500">
                  {finding.elementCount} element{finding.elementCount === 1 ? "" : "s"}
                </span>
              </div>
              <p className="mt-2 text-sm">{finding.description}</p>
              <p className="mt-1 text-xs text-neutral-500">{finding.pageUrl}</p>
              <p className="mt-2 text-sm text-neutral-700">
                <strong>Recommendation:</strong> {finding.recommendation}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
