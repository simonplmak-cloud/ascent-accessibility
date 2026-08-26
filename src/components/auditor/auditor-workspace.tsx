"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { AssessmentTable } from "@/components/auditor/assessment-table";
import { ScoreComparison } from "@/components/auditor/score-comparison";
import { StateBlock } from "@/components/ui/state-block";
import { ButtonLink } from "@/components/ui/button-link";
import type { HistoryItem } from "@/lib/site/history";

export function AuditorWorkspace() {
  const t = useTranslations("auditor");
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyIds, setBusyIds] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/assessments");
      if (!res.ok) throw new Error("load failed");
      const data = (await res.json()) as { assessments: HistoryItem[] };
      setItems(data.assessments ?? []);
    } catch {
      setError(t("loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

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
      setNotice(t("rerunQueued", { url: item.url }));
      await load();
    } catch {
      setError(t("rerunFailed"));
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
      setNotice(t("deleted"));
      await load();
    } catch {
      setError(t("deleteFailed"));
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
        <h1 className="font-display text-2xl font-bold text-terminal-fg">{t("assessments")}</h1>
        <p className="mt-1 font-sans text-sm text-terminal-muted">{t("loading")}</p>
      </div>
    );
  }

  const completed = items.filter((item) => item.status === "completed").length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-display text-2xl font-bold text-terminal-fg">{t("assessments")}</h1>
      <p className="mt-1 font-sans text-sm text-terminal-muted">
        {t("totalCount", { total: items.length, completed })}
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

      {items.length === 0 ? (
        <div className="mt-6">
          <StateBlock
            title={t("emptyTitle")}
            body={t("emptyBody")}
            action={<ButtonLink href="/assess">{t("scanYourSite")}</ButtonLink>}
          />
        </div>
      ) : (
        <>
          <div className="mt-6">
            <AssessmentTable items={items} busyIds={busyIds} onReRun={reRun} onDelete={remove} />
          </div>
          <ScoreComparison items={items} />
        </>
      )}
    </div>
  );
}
