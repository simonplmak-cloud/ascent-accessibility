"use client";

import { useRef, useState } from "react";
import { Report } from "./report";
import { LogPanel } from "./log-panel";
import { Button } from "@/components/ui/button";
import type { AssessmentResult, LogEntry, StandardOption } from "./types";

const STREAM_TIMEOUT_MS = 15 * 60 * 1000;

export function AssessmentForm({
  standards,
  fixedScope,
}: {
  standards: StandardOption[];
  fixedScope?: "page" | "site";
}) {
  const [url, setUrl] = useState("");
  const [standard, setStandard] = useState("wcag22aa");
  const [scope, setScope] = useState<"page" | "site">(fixedScope ?? "page");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [cancelled, setCancelled] = useState(false);
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function startTimer() {
    const start = Date.now();
    timerRef.current = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - start) / 1000));
    }, 1000);
  }

  function stopTimer() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  // A3: cancel aborts the client-side watch (the server-side scan may still
  // finish in the background — the result lands in the auditor workspace).
  function cancelScan() {
    setCancelled(true);
    stopTimer();
    void readerRef.current?.cancel().catch(() => {});
    readerRef.current = null;
    setLoading(false);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setResult(null);
    setLog([]);
    setCancelled(false);
    setElapsedSeconds(0);
    setLoading(true);
    startTimer();

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
        stopTimer();
        return;
      }

      await stream(createData.id);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
      stopTimer();
    }
  }

  async function stream(id: string) {
    const timeout = setTimeout(() => {
      setError("The assessment is still running. Reload this page to check its status.");
      setLoading(false);
      stopTimer();
    }, STREAM_TIMEOUT_MS);

    try {
      const res = await fetch(`/api/v1/assessments/${id}/stream`);
      if (!res.ok || !res.body) {
        throw new Error("stream unavailable");
      }
      const reader = res.body.getReader();
      readerRef.current = reader;
      const decoder = new TextDecoder();
      let buffer = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let newline: number;
        while ((newline = buffer.indexOf("\n")) >= 0) {
          const line = buffer.slice(0, newline).trim();
          buffer = buffer.slice(newline + 1);
          if (!line) continue;
          let event: { type: string; entry?: LogEntry; status?: string; score?: number };
          try {
            event = JSON.parse(line);
          } catch {
            continue;
          }
          if (event.type === "log" && event.entry) {
            setLog((prev) => [...prev, event.entry as LogEntry]);
          } else if (event.type === "done") {
            setResult(event as unknown as AssessmentResult);
            setLoading(false);
            stopTimer();
            return;
          } else if (event.type === "notfound") {
            setError("Assessment not found.");
            setLoading(false);
            stopTimer();
            return;
          }
          // "status" events are informational — the log already reflects progress
        }
      }
    } catch {
      if (!cancelled) {
        setError("Something went wrong. Please try again.");
      }
      setLoading(false);
    } finally {
      readerRef.current = null;
      stopTimer();
      clearTimeout(timeout);
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="url" className="block font-sans text-sm text-terminal-fg">
            Website URL
          </label>
          <input
            id="url"
            type="url"
            required
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="mt-1 w-full rounded border border-terminal-border bg-terminal-surface px-3 py-2 font-sans text-terminal-fg placeholder:text-terminal-muted"
          />
        </div>
        <div>
          <label htmlFor="standard" className="block font-sans text-sm text-terminal-fg">
            Standard
          </label>
          <select
            id="standard"
            value={standard}
            onChange={(e) => setStandard(e.target.value)}
            className="mt-1 w-full rounded border border-terminal-border bg-terminal-surface px-3 py-2 font-sans text-terminal-fg"
          >
            {standards.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <fieldset className="space-y-2">
          <legend className="block font-sans text-sm text-terminal-fg">Scan scope</legend>
          {fixedScope === undefined && (
            <>
              <label className="flex items-center gap-2 font-sans text-sm text-terminal-fg">
                <input
                  type="radio"
                  name="scope"
                  value="site"
                  checked={scope === "site"}
                  onChange={() => setScope("site")}
                />
                Whole website
              </label>
              <label className="flex items-center gap-2 font-sans text-sm text-terminal-fg">
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
            <p className="font-sans text-sm text-terminal-muted">
              Single page — free.
            </p>
          )}
          {fixedScope === "site" && (
            <p className="font-sans text-sm text-terminal-muted">
              Whole website — free.
            </p>
          )}
        </fieldset>
        <Button type="submit" disabled={loading} className="self-start">
          {loading ? "Assessing…" : "Run assessment"}
        </Button>
      </form>

      {error && (
        <p role="alert" className="mt-4 font-sans text-sm text-terminal-critical">
          {error}
        </p>
      )}

      {loading && !result && (
        <div className="mt-4">
          <div className="rounded border border-terminal-border bg-terminal-surface/40 p-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p aria-live="polite" className="font-sans text-sm text-terminal-fg">
                <span className="font-semibold">{stageFromLog(log)}</span>
                <span className="text-terminal-muted"> · {formatElapsed(elapsedSeconds)}</span>
              </p>
              <Button variant="outline" size="sm" onClick={cancelScan}>
                Cancel
              </Button>
            </div>
            <p className="mt-1 font-sans text-xs text-terminal-muted">
              Crawling and scanning can take several minutes for larger sites. Leave this tab open.
            </p>
          </div>
          <div className="mt-2">
            <LogPanel entries={log} />
          </div>
        </div>
      )}

      {cancelled && !result && !loading && (
        <p role="status" className="mt-4 font-sans text-sm text-terminal-muted">
          Stopped watching this scan — it may still complete in the background. Check your auditor
          workspace for the result.
        </p>
      )}

      {result?.status === "failed" && (
        <p role="alert" className="mt-4 font-sans text-sm text-terminal-critical">
          The assessment could not be completed. Please verify the URL is reachable and try
          again.
        </p>
      )}

      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {result?.status === "completed" && (
          <p>
            Assessment complete. {result.findings?.length ?? 0} findings.
          </p>
        )}
      </div>

      {result?.status === "completed" && <Report result={result} />}
    </div>
  );
}

function stageFromLog(entries: LogEntry[]): string {
  if (entries.length === 0) return "Queued";
  const last = entries[entries.length - 1]?.message.toLowerCase() ?? "";
  if (last.includes("crawl") || last.includes("sitemap") || last.includes("fetch")) return "Crawling";
  if (last.includes("ai") || last.includes("vision") || last.includes("triage") || last.includes("review")) {
    return "AI review";
  }
  if (last.includes("score") || last.includes("conformance") || last.includes("report") || last.includes("finalis")) {
    return "Scoring";
  }
  if (last.includes("scan") || last.includes("rule") || last.includes("engine") || last.includes("page")) {
    return "Scanning";
  }
  return "Working";
}

function formatElapsed(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function messageForCode(code: string): string {
  switch (code) {
    case "SSRF_BLOCKED":
      return "That URL is not publicly accessible.";
    case "RATE_LIMITED":
      return "Too many requests. Please wait a moment and try again.";
    case "UNAUTHORIZED":
      return "Please sign in to run an assessment.";
    case "VERIFY_EMAIL":
      return "Please verify your email before running assessments.";
    default:
      return "Please enter a valid website URL.";
  }
}
