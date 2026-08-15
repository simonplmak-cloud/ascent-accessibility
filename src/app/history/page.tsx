"use client";

import { useCallback, useEffect, useState } from "react";
import { HistoryTable } from "@/components/history/history-table";
import { ScoreComparison } from "@/components/history/score-comparison";
import type { HistoryItem } from "@/lib/history";

export default function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busyIds, setBusyIds] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/assessments");
      if (!res.ok) throw new Error("load failed");
      const data = await res.json();
      setItems((data.assessments ?? []) as HistoryItem[]);
      setError(null);
    } catch {
      setError("Could not load assessment history.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function reRun(item: HistoryItem) {
    setBusyIds((prev) => new Set(prev).add(item.id));
    try {
      const res = await fetch("/api/v1/assessments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: item.url, standard: item.standard }),
      });
      if (!res.ok) throw new Error("re-run failed");
      setNotice(`Re-run queued for ${item.url}`);
      await load();
    } catch {
      setError("Could not re-run that assessment.");
    } finally {
      setBusyIds((prev) => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
    }
  }

  async function remove(item: HistoryItem) {
    if (!window.confirm(`Delete the assessment for ${item.url}?`)) return;
    setBusyIds((prev) => new Set(prev).add(item.id));
    try {
      const res = await fetch(`/api/v1/assessments/${item.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("delete failed");
      setNotice("Assessment deleted.");
      await load();
    } catch {
      setError("Could not delete that assessment.");
    } finally {
      setBusyIds((prev) => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
    }
  }

  const completed = items.filter((item) => item.status === "completed").length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-mono text-2xl font-bold text-terminal-fg">Assessments</h1>
      <p className="mt-1 font-mono text-sm text-terminal-muted">
        {items.length} total · {completed} completed
      </p>

      {notice && (
        <p role="status" className="mt-4 font-mono text-sm text-terminal-pass">
          {notice}
        </p>
      )}
      {error && (
        <p role="alert" className="mt-4 font-mono text-sm text-terminal-critical">
          {error}
        </p>
      )}

      {loading ? (
        <p className="mt-8 font-mono text-sm text-terminal-muted">Loading history…</p>
      ) : (
        <>
          <div className="mt-6">
            <HistoryTable items={items} busyIds={busyIds} onReRun={reRun} onDelete={remove} />
          </div>
          <ScoreComparison items={items} />
        </>
      )}
    </div>
  );
}
