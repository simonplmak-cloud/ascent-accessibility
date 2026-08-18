"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

interface QueueItem {
  id: string;
  url: string;
  standard: string;
  conformance: string | null;
  status: string;
}

interface ConformanceRow {
  num: string;
  title: string;
  level: string;
  result: string;
}

const VERDICTS = ["Passed", "Failed", "NotPresent"] as const;

export function ReviewQueue() {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [rows, setRows] = useState<ConformanceRow[]>([]);
  const [resolutions, setResolutions] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/review/queue");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as { assessments: QueueItem[] };
      setItems(data.assessments);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load queue");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function claim(id: string) {
    const res = await fetch(`/api/v1/review/${id}/claim`, { method: "POST" });
    if (res.ok) {
      await load();
    } else {
      const data = (await res.json().catch(() => ({}))) as { code?: string };
      setError(data.code ?? "Claim failed");
    }
  }

  async function open(id: string) {
    setExpanded(id);
    setResolutions({});
    setNotes({});
    const res = await fetch(`/api/v1/assessments/${id}`);
    if (!res.ok) return;
    const data = (await res.json()) as { comparison?: { conformance?: { rows?: ConformanceRow[] } } };
    const cannotTell = (data.comparison?.conformance?.rows ?? []).filter(
      (r) => r.result === "CannotTell",
    );
    setRows(cannotTell);
  }

  async function submit(id: string) {
    const body = {
      resolutions: Object.fromEntries(
        rows.map((row) => [
          row.num,
          { verdict: resolutions[row.num] ?? "Passed", note: notes[row.num] ?? "" },
        ]),
      ),
    };
    const res = await fetch(`/api/v1/review/${id}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      setExpanded(null);
      setRows([]);
      await load();
    } else {
      const data = (await res.json().catch(() => ({}))) as { code?: string };
      setError(data.code ?? "Submit failed");
    }
  }

  return (
    <section aria-labelledby="review-queue-heading">
      <h1 id="review-queue-heading" className="font-mono text-2xl font-bold text-terminal-fg">
        Review queue
      </h1>
      {error && (
        <p role="alert" className="mt-4 font-mono text-sm text-terminal-critical">
          {error}
        </p>
      )}
      {loading ? (
        <p className="mt-4 font-mono text-sm text-terminal-muted">Loading…</p>
      ) : items.length === 0 ? (
        <p className="mt-4 font-mono text-sm text-terminal-muted">No reviews pending.</p>
      ) : (
        <ul className="mt-6 space-y-4">
          {items.map((item) => (
            <li key={item.id} className="rounded border border-terminal-border p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <Link
                    href={`/assess/${item.id}`}
                    className="block truncate font-mono text-sm text-terminal-fg underline-offset-4 hover:underline"
                    title={item.url}
                  >
                    {item.url}
                  </Link>
                  <p className="font-mono text-xs text-terminal-muted">{item.standard}</p>
                </div>
                <div className="flex gap-2">
                  {item.status === "completed" && (
                    <button
                      type="button"
                      onClick={() => void claim(item.id)}
                      className="rounded border border-terminal-border px-3 py-1 font-mono text-sm text-terminal-fg hover:border-terminal-serious"
                    >
                      Claim
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => void open(item.id)}
                    className="rounded border border-terminal-border px-3 py-1 font-mono text-sm text-terminal-fg hover:border-terminal-serious"
                  >
                    Review
                  </button>
                </div>
              </div>

              {expanded === item.id && (
                <div className="mt-4 border-t border-terminal-border pt-4">
                  {rows.length === 0 ? (
                    <p className="font-mono text-sm text-terminal-muted">
                      No &ldquo;Cannot tell&rdquo; criteria to resolve.
                    </p>
                  ) : (
                    <>
                      <ul className="space-y-3">
                        {rows.map((row) => (
                          <li key={row.num} className="rounded border border-terminal-border p-3">
                            <p className="font-mono text-sm text-terminal-fg">
                              {row.num} {row.title}{" "}
                              <span className="text-terminal-muted">(Level {row.level})</span>
                            </p>
                            <div className="mt-2 flex flex-wrap items-center gap-3">
                              <select
                                value={resolutions[row.num] ?? "Passed"}
                                onChange={(e) =>
                                  setResolutions((r) => ({ ...r, [row.num]: e.target.value }))
                                }
                                className="rounded border border-terminal-border bg-terminal-surface px-2 py-1 font-mono text-sm text-terminal-fg"
                              >
                                {VERDICTS.map((v) => (
                                  <option key={v} value={v}>
                                    {v}
                                  </option>
                                ))}
                              </select>
                              <input
                                type="text"
                                placeholder="Rationale (optional)"
                                value={notes[row.num] ?? ""}
                                onChange={(e) =>
                                  setNotes((n) => ({ ...n, [row.num]: e.target.value }))
                                }
                                className="flex-1 rounded border border-terminal-border bg-terminal-surface px-2 py-1 font-mono text-sm text-terminal-fg"
                              />
                            </div>
                          </li>
                        ))}
                      </ul>
                      <button
                        type="button"
                        onClick={() => void submit(item.id)}
                        className="mt-4 rounded bg-terminal-fg px-4 py-2 font-mono text-sm text-terminal-bg hover:bg-terminal-serious"
                      >
                        Submit review
                      </button>
                    </>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
