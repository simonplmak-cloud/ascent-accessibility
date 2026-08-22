"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import type { ViewState } from "@/lib/efficiency/saved-views";

const STORAGE_KEY = "wcag-saved-views";

export interface SavedView {
  name: string;
  state: ViewState;
}

// Named filter/sort presets persisted to localStorage, applied via onApply.
export function SavedViews({
  current,
  onApply,
}: {
  current: ViewState;
  onApply: (view: ViewState) => void;
}) {
  const t = useTranslations("common");
  const [views, setViews] = useState<SavedView[]>([]);
  const [name, setName] = useState("");

  useEffect(() => {
    try {
      setViews(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as SavedView[]);
    } catch {
      setViews([]);
    }
  }, []);

  function persist(next: SavedView[]) {
    setViews(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Persistence is best-effort; the in-memory list still works this session.
    }
  }

  function save() {
    const n = name.trim();
    if (!n) return;
    persist([...views.filter((v) => v.name !== n), { name: n, state: current }]);
    setName("");
  }

  function remove(n: string) {
    persist(views.filter((v) => v.name !== n));
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="font-sans text-sm text-terminal-muted">{t("views")}</span>
      {views.map((view) => (
        <span
          key={view.name}
          className="flex items-center gap-1 rounded border border-terminal-border px-2 py-0.5"
        >
          <button
            type="button"
            onClick={() => onApply(view.state)}
            className="font-sans text-sm text-terminal-fg hover:underline"
          >
            {view.name}
          </button>
          <button
            type="button"
            onClick={() => remove(view.name)}
            aria-label={t("deleteView", { name: view.name })}
            className="font-sans text-xs text-terminal-muted hover:text-terminal-critical"
          >
            ×
          </button>
        </span>
      ))}
      <input
        aria-label={t("saveViewName")}
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={t("saveCurrentView")}
        className="rounded border border-terminal-border bg-terminal-surface px-2 py-0.5 font-sans text-sm text-terminal-fg placeholder:text-terminal-muted"
      />
      <button
        type="button"
        onClick={save}
        disabled={!name.trim()}
        className="rounded border border-terminal-border px-2 py-0.5 font-sans text-sm text-terminal-fg hover:bg-terminal-surface disabled:opacity-50"
      >
        {t("save")}
      </button>
    </div>
  );
}
