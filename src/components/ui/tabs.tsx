"use client";

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";

export interface Tab {
  id: string;
  label: ReactNode;
}

// Accessible tabs: role=tablist/tab/tabpanel, aria-selected, roving tabindex with
// arrow-key navigation. `children` is a render-prop receiving the active tab id.
export function Tabs({
  tabs,
  defaultId,
  label,
  children,
}: {
  tabs: Tab[];
  defaultId?: string | undefined;
  label: string;
  children: (activeId: string) => ReactNode;
}) {
  const [active, setActive] = useState<string>(defaultId ?? tabs[0]?.id ?? "");
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const base = useId();
  const activeIndex = Math.max(0, tabs.findIndex((tab) => tab.id === active));

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    let next: number;
    if (event.key === "ArrowRight") next = (activeIndex + 1) % tabs.length;
    else if (event.key === "ArrowLeft") next = (activeIndex - 1 + tabs.length) % tabs.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = tabs.length - 1;
    else return;
    event.preventDefault();
    const nextTab = tabs[next];
    if (!nextTab) return;
    setActive(nextTab.id);
    refs.current[next]?.focus();
  }

  return (
    <div>
      <div
        role="tablist"
        aria-label={label}
        className="flex flex-wrap gap-1 border-b border-terminal-border"
      >
        {tabs.map((tab, i) => {
          const selected = tab.id === active;
          return (
            <button
              key={tab.id}
              ref={(el) => {
                refs.current[i] = el;
              }}
              role="tab"
              id={`${base}-tab-${tab.id}`}
              aria-selected={selected}
              aria-controls={selected ? `${base}-panel-${tab.id}` : undefined}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(tab.id)}
              onKeyDown={onKeyDown}
              className={`rounded-t border border-b-0 px-3 py-2 min-h-11 font-sans text-sm ${
                selected
                  ? "border-terminal-border bg-terminal-surface font-semibold text-brandLink"
                  : "border-transparent text-terminal-muted hover:text-terminal-fg"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      <div
        role="tabpanel"
        id={`${base}-panel-${active}`}
        aria-labelledby={`${base}-tab-${active}`}
        tabIndex={0}
        className="pt-4"
      >
        {children(active)}
      </div>
    </div>
  );
}
