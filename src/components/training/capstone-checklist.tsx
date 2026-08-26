"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export function CapstoneChecklist() {
  const t = useTranslations("training");
  const steps = t.raw("capstoneSteps") as string[];
  const [done, setDone] = useState<Set<number>>(new Set());

  function toggle(i: number) {
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  const complete = done.size === steps.length;

  return (
    <div className="mt-6 rounded border border-terminal-border bg-terminal-surface/40 p-4">
      <h2 className="font-sans text-sm font-semibold text-terminal-fg">
        {t("capstoneChecklist", { done: done.size, total: steps.length })}
      </h2>
      <ul className="mt-2 space-y-2">
        {steps.map((step, i) => (
          <li key={i}>
            <label className="flex items-start gap-2 font-sans text-sm text-terminal-fg">
              <input
                type="checkbox"
                checked={done.has(i)}
                onChange={() => toggle(i)}
                className="mt-1"
              />
              {step}
            </label>
          </li>
        ))}
      </ul>
      {complete && (
        <p role="status" className="mt-3 font-sans text-sm text-terminal-pass">
          {t("capstoneComplete")}
        </p>
      )}
    </div>
  );
}
