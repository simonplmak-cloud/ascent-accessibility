"use client";

import { useState } from "react";

const STEPS = [
  "Define the evaluation scope (target site, WCAG 2.2 AA)",
  "Explore the site and choose a representative sample",
  "Evaluate the sample — automated + manual + screen reader",
  "Record evidence for each finding (URL, SC, impact, steps)",
  "Report the outcome and a conformance conclusion",
];

export function CapstoneChecklist() {
  const [done, setDone] = useState<Set<number>>(new Set());

  function toggle(i: number) {
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  const complete = done.size === STEPS.length;

  return (
    <div className="mt-6 rounded border border-terminal-border bg-terminal-surface/40 p-4">
      <h2 className="font-sans text-sm font-semibold text-terminal-fg">
        Capstone checklist ({done.size}/{STEPS.length})
      </h2>
      <ul className="mt-2 space-y-2">
        {STEPS.map((step, i) => (
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
          All steps complete — finish the lesson to earn your certificate.
        </p>
      )}
    </div>
  );
}
