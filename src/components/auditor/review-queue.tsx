"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { MasterDetail, type MasterDetailItem } from "@/components/efficiency/master-detail";
import { StateBlock } from "@/components/ui/state-block";

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

const MAX_VISIBLE = 20;

export function ReviewQueue() {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<ConformanceRow[]>([]);
  const [resolutions, setResolutions] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

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
    setSubmitted(null);
    setResolutions({});
    setNotes({});
    setRows([]);
    const res = await fetch(`/api/v1/assessments/${id}`);
    if (!res.ok) return;
    const data = (await res.json()) as { comparison?: { conformance?: { rows?: ConformanceRow[] } } };
    setRows((data.comparison?.conformance?.rows ?? []).filter((r) => r.result === "CannotTell"));
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
      setSubmitted(id);
      setRows([]);
      await load();
    } else {
      const data = (await res.json().catch(() => ({}))) as { code?: string };
      setError(data.code ?? "Submit failed");
    }
  }

  const detail = (id: string) => (
    <div className="rounded border border-terminal-border bg-terminal-surface p-4">
      <h2 className="font-display text-base font-semibold text-terminal-fg">Review</h2>
      {submitted === id ? (
        <p role="status" className="mt-3 font-sans text-sm text-terminal-pass">
          Review submitted ✓
        </p>
      ) : rows.length === 0 ? (
        <p className="mt-3 font-sans text-sm text-terminal-muted">
          No &ldquo;Cannot tell&rdquo; criteria to resolve.
        </p>
      ) : (
        <>
          <ul className="mt-3 space-y-3">
            {rows.map((row) => (
              <li key={row.num} className="rounded border border-terminal-border p-3">
                <p className="font-sans text-sm text-terminal-fg">
                  {row.num} {row.title}{" "}
                  <span className="text-terminal-muted">(Level {row.level})</span>
                </p>
                <div className="mt-2 flex flex-col gap-2">
                  <select
                    aria-label={`Verdict for ${row.num}`}
                    value={resolutions[row.num] ?? "Passed"}
                    onChange={(e) => setResolutions((r) => ({ ...r, [row.num]: e.target.value }))}
                    className="rounded border border-terminal-border bg-terminal-surface px-2 py-1 font-sans text-sm text-terminal-fg"
                  >
                    {VERDICTS.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    aria-label={`Rationale for ${row.num}`}
                    placeholder="Rationale (optional)"
                    value={notes[row.num] ?? ""}
                    onChange={(e) => setNotes((n) => ({ ...n, [row.num]: e.target.value }))}
                    className="rounded border border-terminal-border bg-terminal-surface px-2 py-1 font-sans text-sm text-terminal-fg"
                  />
                </div>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => void submit(id)}
            className="mt-4 rounded bg-terminal-fg px-4 py-2 font-sans text-sm text-terminal-bg hover:bg-terminal-serious"
          >
            Submit review
          </button>
        </>
      )}
    </div>
  );

  const masterItems: MasterDetailItem[] = (showAll ? items : items.slice(0, MAX_VISIBLE)).map((item) => ({
    id: item.id,
    render: ({ selected, active }) => (
      <div
        className={`mb-2 rounded border p-3 ${
          active ? "border-terminal-serious" : "border-terminal-border"
        } ${selected ? "bg-terminal-bg" : "bg-transparent"}`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <Link
              href={`/auditor/report/${item.id}`}
              onClick={(e) => e.stopPropagation()}
              className="block truncate font-sans text-sm text-terminal-fg underline-offset-4 hover:underline"
              title={item.url}
            >
              {item.url}
            </Link>
            <p className="font-sans text-xs text-terminal-muted">{item.standard}</p>
          </div>
          <div className="flex items-center gap-3">
            {item.status === "completed" && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  void claim(item.id);
                }}
                className="rounded border border-terminal-border px-3 py-1 font-sans text-sm text-terminal-fg hover:border-terminal-serious"
              >
                Claim
              </button>
            )}
            <span aria-hidden="true" className="font-sans text-xs text-terminal-muted">
              Review →
            </span>
          </div>
        </div>
      </div>
    ),
  }));

  return (
    <section aria-labelledby="review-queue-heading">
      <h1 id="review-queue-heading" className="font-display text-2xl font-bold text-terminal-fg">
        Review queue
      </h1>
      {error && (
        <p role="alert" className="mt-4 font-sans text-sm text-terminal-critical">
          {error}
        </p>
      )}
      {loading ? (
        <p className="mt-4 font-sans text-sm text-terminal-muted">Loading…</p>
      ) : items.length === 0 ? (
        <div className="mt-6">
          <StateBlock
            title="No reviews pending"
            body="When an assessment needs human judgement it will appear here for you to claim and resolve."
          />
        </div>
      ) : (
        <div className="mt-6">
          <p className="mb-2 font-sans text-xs text-terminal-muted">
            j/k to move · Enter to review · Esc to close
          </p>
          <MasterDetail items={masterItems} detail={detail} onOpen={(id) => void open(id)} />
          {items.length > MAX_VISIBLE && (
            <button
              type="button"
              onClick={() => setShowAll((value) => !value)}
              className="mt-3 font-sans text-sm text-terminal-fg underline underline-offset-4 hover:text-terminal-serious"
            >
              {showAll ? "Show fewer" : `Show all ${items.length} assessments`}
            </button>
          )}
        </div>
      )}
    </section>
  );
}
