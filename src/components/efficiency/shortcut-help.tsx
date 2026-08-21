"use client";

import { useEffect, useRef } from "react";
import { GLOBAL_SHORTCUTS } from "@/lib/efficiency/keyboard";

export function ShortcutHelp({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      aria-labelledby="shortcut-help-title"
      className="w-[min(24rem,calc(100vw-2rem))] rounded border border-terminal-border bg-terminal-surface p-0 text-terminal-fg backdrop:bg-black/50"
    >
      <div className="px-5 py-4">
        <h2 id="shortcut-help-title" className="font-mono text-lg font-semibold text-terminal-fg">
          Keyboard shortcuts
        </h2>
        <ul className="mt-3 space-y-2">
          {GLOBAL_SHORTCUTS.map((s) => (
            <li key={s.keys} className="flex items-center justify-between gap-3 font-mono text-sm">
              <span className="text-terminal-muted">{s.action}</span>
              <kbd className="rounded border border-terminal-border bg-terminal-bg px-2 py-0.5 text-xs text-terminal-fg">
                {s.keys}
              </kbd>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex justify-end border-t border-terminal-border px-5 py-3">
        <button
          type="button"
          onClick={onClose}
          className="rounded bg-terminal-fg px-4 py-2 font-mono text-sm font-medium text-terminal-bg hover:bg-terminal-serious"
        >
          Close
        </button>
      </div>
    </dialog>
  );
}
