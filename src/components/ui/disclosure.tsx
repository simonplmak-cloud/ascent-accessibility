"use client";

import { useId, useState, type ReactNode } from "react";

type DisclosureSize = "sm" | "md" | "lg";

const TITLE_SIZES: Record<DisclosureSize, string> = {
  sm: "text-sm font-medium",
  md: "text-sm font-semibold",
  lg: "text-lg font-semibold",
};

// Collapsible section. A disclosure button (aria-expanded + aria-controls)
// wrapping a heading, with a region for the content. Keyboard- and
// screen-reader friendly; used to shorten long, reference-style content.
export function Disclosure({
  title,
  defaultOpen = false,
  as: Heading = "h3",
  size = "sm",
  children,
}: {
  title: ReactNode;
  defaultOpen?: boolean;
  as?: "h2" | "h3" | "h4";
  size?: DisclosureSize;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();

  return (
    <section className="overflow-hidden rounded border border-terminal-border bg-terminal-surface/40">
      <Heading className="m-0">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls={open ? id : undefined}
          className={`flex w-full items-center justify-between gap-3 px-3 py-2 text-left font-sans ${TITLE_SIZES[size]} text-terminal-fg hover:bg-terminal-surface`}
        >
          <span>{title}</span>
          <span aria-hidden="true" className="shrink-0 text-terminal-muted">
            {open ? "▴" : "▾"}
          </span>
        </button>
      </Heading>
      {open && (
        <div id={id} className="border-t border-terminal-border px-3 py-3">
          {children}
        </div>
      )}
    </section>
  );
}
