"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/lib/use-theme";

type TextSize = "normal" | "large" | "xlarge";

const TEXT_SIZES: Array<{ value: TextSize; label: string }> = [
  { value: "normal", label: "Normal" },
  { value: "large", label: "Large" },
  { value: "xlarge", label: "Extra large" },
];

// Consolidated display preferences (theme + text size) behind a single [Aa]
// control, replacing the two inline header toggles.
export function PreferencesDialog() {
  const [open, setOpen] = useState(false);
  const [size, setSize] = useState<TextSize>("normal");
  const { theme, setTheme } = useTheme();
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("text-size") as TextSize | null;
    if (saved && TEXT_SIZES.some((s) => s.value === saved)) setSize(saved);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.textSize = size;
    try {
      localStorage.setItem("text-size", size);
    } catch {
      // Preference applies for the session even if storage is unavailable.
    }
  }, [size]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-label="Display preferences"
        title="Display preferences"
        className="rounded border border-terminal-border px-2 py-1 font-sans text-sm text-terminal-fg hover:bg-terminal-surface"
      >
        Aa
      </button>

      <dialog
        ref={dialogRef}
        onClose={() => setOpen(false)}
        aria-labelledby="prefs-title"
        className="w-[min(20rem,calc(100vw-2rem))] rounded border border-terminal-border bg-terminal-surface p-0 text-terminal-fg backdrop:bg-black/50"
      >
        <div className="border-b border-terminal-border px-5 py-4">
          <h2 id="prefs-title" className="font-display text-base font-semibold text-terminal-fg">
            Display preferences
          </h2>
        </div>

        <div className="space-y-5 px-5 py-5">
          <fieldset>
            <legend className="font-sans text-sm font-semibold text-terminal-fg">Text size</legend>
            <div className="mt-2 space-y-2">
              {TEXT_SIZES.map((option) => (
                <label key={option.value} className="flex items-center gap-2 font-sans text-sm text-terminal-fg">
                  <input
                    type="radio"
                    name="pref-text-size"
                    checked={size === option.value}
                    onChange={() => setSize(option.value)}
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="font-sans text-sm font-semibold text-terminal-fg">Theme</legend>
            <div className="mt-2 space-y-2">
              {(["dark", "light"] as const).map((option) => (
                <label key={option} className="flex items-center gap-2 font-sans text-sm text-terminal-fg">
                  <input
                    type="radio"
                    name="pref-theme"
                    checked={theme === option}
                    onChange={() => setTheme(option)}
                  />
                  {option === "dark" ? "Dark" : "Light"}
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        <div className="flex justify-end border-t border-terminal-border px-5 py-3">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded bg-terminal-fg px-4 py-2 font-sans text-sm font-medium text-terminal-bg hover:bg-terminal-serious"
          >
            Done
          </button>
        </div>
      </dialog>
    </>
  );
}
