"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import type { LogEntry } from "./types";

function levelClass(level: LogEntry["level"]): string {
  switch (level) {
    case "error":
      return "text-terminal-critical";
    case "warn":
      return "text-terminal-serious";
    default:
      return "text-terminal-fg";
  }
}

export function LogPanel({ entries }: { entries: LogEntry[] }) {
  const t = useTranslations("report");
  const [autoScroll, setAutoScroll] = useState(true);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight;
    }
  }, [entries, autoScroll]);

  return (
    <div className="rounded border border-terminal-border bg-terminal-surface">
      <div className="flex items-center justify-between border-b border-terminal-border px-3 py-1">
        <h3 className="font-sans text-sm font-semibold text-terminal-fg">{t("scanLog")}</h3>
        <button
          type="button"
          onClick={() => setAutoScroll((value) => !value)}
          className="font-sans text-xs text-terminal-fg underline underline-offset-2 hover:text-terminal-serious"
        >
          {autoScroll ? t("autoScrollOn") : t("autoScrollOff")}
        </button>
      </div>
      <div
        ref={ref}
        role="log"
        aria-live="polite"
        className="h-64 overflow-y-auto px-3 py-2 font-mono text-xs leading-5"
      >
        {entries.length === 0 ? (
          <p className="text-terminal-muted">{t("noLogEntries")}</p>
        ) : (
          entries.map((entry, index) => (
            <p key={`${entry.timestamp}-${index}`} className={levelClass(entry.level)}>
              <span className="text-terminal-muted">[{entry.timestamp.slice(11, 19)}]</span>{" "}
              {entry.message}
            </p>
          ))
        )}
      </div>
    </div>
  );
}
