"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export interface MasterDetailItem {
  id: string;
  render: (props: { selected: boolean; active: boolean }) => ReactNode;
}

// Master–detail split: a navigable list (left) + a side panel (right) for the
// selected item. j/k or ArrowUp/Down move the active row, Enter opens the detail,
// Esc closes it. Focus is restored to the list when the panel closes.
export function MasterDetail({
  items,
  detail,
  onOpen,
}: {
  items: MasterDetailItem[];
  detail: (id: string) => ReactNode;
  onOpen?: (id: string) => void;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [openId, setOpenId] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  function open(id: string) {
    setOpenId(id);
    onOpen?.(id);
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select" || target?.isContentEditable) {
        return;
      }
      if (e.key === "j" || e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, items.length - 1));
      } else if (e.key === "k" || e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const item = items[activeIndex];
        if (item) open(item.id);
      } else if (e.key === "Escape" && openId) {
        setOpenId(null);
        listRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [items, activeIndex, openId]);

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
      <div ref={listRef} tabIndex={-1} className="min-w-0 flex-1">
        {items.map((item, i) => (
          <div key={item.id} onClick={() => { setActiveIndex(i); open(item.id); }}>
            {item.render({ selected: openId === item.id, active: i === activeIndex })}
          </div>
        ))}
      </div>
      {openId && (
        <aside aria-label="Detail" className="w-full shrink-0 lg:w-96">
          {detail(openId)}
        </aside>
      )}
    </div>
  );
}
