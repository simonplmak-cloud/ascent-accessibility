"use client";

import { useEffect, useState } from "react";

type TextSize = "normal" | "large" | "xlarge";

const ORDER: TextSize[] = ["normal", "large", "xlarge"];

export function TextSizeControl() {
  const [size, setSize] = useState<TextSize>("normal");

  useEffect(() => {
    const saved = localStorage.getItem("text-size") as TextSize | null;
    if (saved && ORDER.includes(saved)) setSize(saved);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.textSize = size;
    localStorage.setItem("text-size", size);
  }, [size]);

  const decrease = () =>
    setSize((s) => ORDER[Math.max(ORDER.indexOf(s) - 1, 0)] ?? "normal");
  const increase = () =>
    setSize((s) => ORDER[Math.min(ORDER.indexOf(s) + 1, ORDER.length - 1)] ?? "xlarge");

  return (
    <div className="flex items-center gap-1" role="group" aria-label="Text size">
      <button
        type="button"
        onClick={decrease}
        disabled={size === "normal"}
        aria-label="Decrease text size"
        className="rounded border border-terminal-border px-2 py-1 font-mono text-sm text-terminal-fg hover:bg-terminal-surface disabled:opacity-40"
      >
        A−
      </button>
      <button
        type="button"
        onClick={increase}
        disabled={size === "xlarge"}
        aria-label="Increase text size"
        className="rounded border border-terminal-border px-2 py-1 font-mono text-sm text-terminal-fg hover:bg-terminal-surface disabled:opacity-40"
      >
        A+
      </button>
    </div>
  );
}
