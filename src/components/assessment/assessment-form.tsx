"use client";

import { useState } from "react";
import { Report } from "./report";
import { LogPanel } from "./log-panel";
import type { AssessmentResult, LogEntry, StandardOption } from "./types";

const MAX_POLLS = 300;
const POLL_INTERVAL_MS = 3000;

export function AssessmentForm({
  standards,
  fixedScope,
}: {
  standards: StandardOption[];
  fixedScope?: "page" | "site";
}) {
  const [url, setUrl] = useState("");
  const [standard, setStandard] = useState("wcag22aa");
  const [scope, setScope] = useState<"page" | "site">(fixedScope ?? "site");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [log, setLog] = useState<LogEntry[]>([]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setResult(null);
    setLog([]);
    setLoading(true);

    try {
      const createRes = await fetch("/api/v1/assessments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, standard, scope }),
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
      setError("The assessment is still running. Reload this page to check its status.");
      setLoading(false);
      return;
    }
    const res = await fetch(`/api/v1/assessments/${id}`);
    const data = await res.json();
    if (data.log) setLog(data.log);
    if (data.status === "completed" || data.status === "failed") {
      setResult(data);
      setLoading(false);
      return;
    }
    setTimeout(() => poll(id, attempt + 1), POLL_INTERVAL_MS);
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="url" className="block font-mono text-sm text-terminal-fg">
            Website URL
          </label>
          <input
            id="url"
            type="url"
            required
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="mt-1 w-full rounded border border-terminal-border bg-terminal-surface px-3 py-2 font-mono text-terminal-fg placeholder:text-terminal-muted"
          />
        </div>
        <div>
          <label htmlFor="standard" className="block font-mono text-sm text-terminal-fg">
            Standard
          </label>
          <select
            id="standard"
            value={standard}
            onChange={(e) => setStandard(e.target.value)}
            className="mt-1 w-full rounded border border-terminal-border bg-terminal-surface px-3 py-2 font-mono text-terminal-fg"
          >
            {standards.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <fieldset className="space-y-2">
          <legend className="block font-mono text-sm text-terminal-fg">Scan scope</legend>
          {fixedScope === undefined && (
            <>
              <label className="flex items-center gap-2 font-mono text-sm text-terminal-fg">
                <input
                  type="radio"
                  name="scope"
                  value="site"
                  checked={scope === "site"}
                  onChange={() => setScope("site")}
                />
                Whole website
              </label>
              <label className="flex items-center gap-2 font-mono text-sm text-terminal-fg">
                <input
                  type="radio"
                  name="scope"
                  value="page"
                  checked={scope === "page"}
                  onChange={() => setScope("page")}
                />
                Single page
              </label>
            </>
          )}
          {fixedScope === "page" && (
            <p className="font-mono text-sm text-terminal-muted">
              Single page — free, no account required.
            </p>
          )}
          {fixedScope === "site" && (
            <p className="font-mono text-sm text-terminal-muted">
              Whole website — subscriber feature.
            </p>
          )}
        </fieldset>
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-terminal-fg px-6 py-2 font-mono text-terminal-bg hover:bg-terminal-serious disabled:opacity-50"
        >
          {loading ? "Assessing…" : "Run assessment"}
        </button>
      </form>

      {error && (
        <p role="alert" className="mt-4 font-mono text-sm text-terminal-critical">
          {error}
        </p>
      )}

      {loading && !result && (
        <div className="mt-4">
          <p aria-live="polite" className="mb-2 font-mono text-sm text-terminal-fg">
            Assessment in progress — crawling and scanning can take several minutes for
            larger sites. Leave this tab open.
          </p>
          <LogPanel entries={log} />
        </div>
      )}

      {result?.status === "failed" && (
        <p role="alert" className="mt-4 font-mono text-sm text-terminal-critical">
          The assessment could not be completed. Please verify the URL is reachable and try
          again.
        </p>
      )}

      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {result?.status === "completed" && (
          <p>
            Assessment complete. Score: {result.score ?? "n/a"} out of 100.{" "}
            {result.findings?.length ?? 0} findings.
          </p>
        )}
      </div>

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
    case "UNAUTHORIZED":
      return "Whole-website scans require an account. Please sign in.";
    case "PAYMENT_REQUIRED":
      return "Whole-website scans require an active subscription.";
    default:
      return "Please enter a valid website URL.";
  }
}
