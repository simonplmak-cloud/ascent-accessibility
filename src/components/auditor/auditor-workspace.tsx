"use client";

import { useEffect, useState } from "react";
import { AssessmentTable } from "@/components/auditor/assessment-table";
import { ScoreComparison } from "@/components/auditor/score-comparison";
import type { HistoryItem } from "@/lib/history";

export function AuditorWorkspace() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyIds, setBusyIds] = useState<Set<string>>(new Set());

  async function load() {
    try {
      const res = await fetch("/api/v1/assessments");
      if (!res.ok) throw new Error("load failed");
      const data = (await res.json()) as { assessments: HistoryItem[] };
      setItems(data.assessments ?? []);
    } catch {
      setError("Could not load history.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function reRun(item: HistoryItem) {
    setError(null);
    setNotice(null);
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
    setError(null);
    setNotice(null);
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

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="font-display text-2xl font-bold text-terminal-fg">Assessments</h1>
        <p className="mt-1 font-sans text-sm text-terminal-muted">Loading…</p>
      </div>
    );
  }

  const completed = items.filter((item) => item.status === "completed").length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-display text-2xl font-bold text-terminal-fg">Assessments</h1>
      <p className="mt-1 font-sans text-sm text-terminal-muted">
        {items.length} total · {completed} completed
      </p>

      {notice && (
        <p role="status" className="mt-4 font-sans text-sm text-terminal-pass">
          {notice}
        </p>
      )}
      {error && (
        <p role="alert" className="mt-4 font-sans text-sm text-terminal-critical">
          {error}
        </p>
      )}

      <div className="mt-6">
        <AssessmentTable items={items} busyIds={busyIds} onReRun={reRun} onDelete={remove} />
      </div>
      <ScoreComparison items={items} />
    </div>
  );
}
