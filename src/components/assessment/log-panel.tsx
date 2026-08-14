"use client";

import { useEffect, useRef, useState } from "react";
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
        <h3 className="font-mono text-sm font-semibold text-terminal-fg">Scan log</h3>
        <button
          type="button"
          onClick={() => setAutoScroll((value) => !value)}
          className="font-mono text-xs text-terminal-fg underline underline-offset-2 hover:text-terminal-serious"
        >
          {autoScroll ? "auto-scroll on" : "auto-scroll off"}
        </button>
      </div>
      <div
        ref={ref}
        role="log"
        aria-live="polite"
        className="h-64 overflow-y-auto px-3 py-2 font-mono text-xs leading-5"
      >
        {entries.length === 0 ? (
          <p className="text-terminal-muted">No log entries yet.</p>
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
