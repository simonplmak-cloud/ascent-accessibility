"use client";

import { useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
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
  const t = useTranslations("assess");
  const locale = useLocale();
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
        body: JSON.stringify({ url, standard, scope, locale }),
      });
      const createData = await createRes.json();

      if (!createRes.ok) {
        setError(messageForCode(createData.code, t));
        setLoading(false);
        stopTimer();
        return;
      }

      await stream(createData.id);
    } catch {
      setError(t("errGeneric"));
      setLoading(false);
      stopTimer();
    }
  }

  async function stream(id: string) {
    const timeout = setTimeout(() => {
      setError(t("errStillRunning"));
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
            setError(t("errNotFound"));
            setLoading(false);
            stopTimer();
            return;
          }
          // "status" events are informational — the log already reflects progress
        }
      }
    } catch {
      if (!cancelled) {
        setError(t("errGeneric"));
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
            {t("urlLabel")}
          </label>
          <input
            id="url"
            type="url"
            required
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="mt-1 w-full rounded border border-terminal-border bg-terminal-surface px-3 py-2 min-h-11 font-sans text-terminal-fg placeholder:text-terminal-muted"
          />
        </div>
        <div>
          <label htmlFor="standard" className="block font-sans text-sm text-terminal-fg">
            {t("standardLabel")}
          </label>
          <select
            id="standard"
            value={standard}
            onChange={(e) => setStandard(e.target.value)}
            className="mt-1 w-full rounded border border-terminal-border bg-terminal-surface px-3 py-2 min-h-11 font-sans text-terminal-fg"
          >
            {standards.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <fieldset className="space-y-2">
          <legend className="block font-sans text-sm text-terminal-fg">{t("scopeLabel")}</legend>
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
                {t("wholeSite")}
              </label>
              <label className="flex items-center gap-2 font-sans text-sm text-terminal-fg">
                <input
                  type="radio"
                  name="scope"
                  value="page"
                  checked={scope === "page"}
                  onChange={() => setScope("page")}
                />
                {t("singlePage")}
              </label>
            </>
          )}
          {fixedScope === "page" && (
            <p className="font-sans text-sm text-terminal-muted">
              {t("singlePageFree")}
            </p>
          )}
          {fixedScope === "site" && (
            <p className="font-sans text-sm text-terminal-muted">
              {t("wholeSiteFree")}
            </p>
          )}
        </fieldset>
        <Button type="submit" disabled={loading} className="self-start">
          {loading ? t("scanning") : t("runScan")}
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
                <span className="font-semibold">{stageFromLog(log, t)}</span>
                <span className="text-terminal-muted"> · {formatElapsed(elapsedSeconds)}</span>
              </p>
              <Button variant="outline" size="sm" onClick={cancelScan}>
                {t("cancel")}
              </Button>
            </div>
            <p className="mt-1 font-sans text-xs text-terminal-muted">
              {t("progressNote")}
            </p>
          </div>
          <div className="mt-2">
            <LogPanel entries={log} />
          </div>
        </div>
      )}

      {cancelled && !result && !loading && (
        <p role="status" className="mt-4 font-sans text-sm text-terminal-muted">
          {t("cancelledNote")}
        </p>
      )}

      {result?.status === "failed" && (
        <p role="alert" className="mt-4 font-sans text-sm text-terminal-critical">
          {t("failedNote")}
        </p>
      )}

      {result?.status === "blocked" && (
        <p role="alert" className="mt-4 font-sans text-sm text-terminal-critical">
          {t("blockedNote")}
        </p>
      )}

      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {result?.status === "completed" && (
          <p>
            {t("completeNote", { count: result.findings?.length ?? 0 })}
          </p>
        )}
      </div>

      {result?.status === "completed" && <Report result={result} />}
    </div>
  );
}

function stageFromLog(
  entries: LogEntry[],
  t: ReturnType<typeof useTranslations<"assess">>,
): string {
  if (entries.length === 0) return t("stageQueued");
  const last = entries[entries.length - 1]?.message.toLowerCase() ?? "";
  if (last.includes("crawl") || last.includes("sitemap") || last.includes("fetch")) return t("stageCrawling");
  if (last.includes("ai") || last.includes("vision") || last.includes("triage") || last.includes("review")) {
    return t("stageAiReview");
  }
  if (last.includes("score") || last.includes("conformance") || last.includes("report") || last.includes("finalis")) {
    return t("stageScoring");
  }
  if (last.includes("scan") || last.includes("rule") || last.includes("engine") || last.includes("page")) {
    return t("stageScanning");
  }
  return t("stageWorking");
}

function formatElapsed(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function messageForCode(
  code: string,
  t: ReturnType<typeof useTranslations<"assess">>,
): string {
  switch (code) {
    case "SSRF_BLOCKED":
      return t("errSsr");
    case "RATE_LIMITED":
      return t("errRateLimited");
    case "UNAUTHORIZED":
      return t("errUnauthorized");
    case "VERIFY_EMAIL":
      return t("errVerifyEmail");
    default:
      return t("errInvalidUrl");
  }
}
