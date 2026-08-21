import type { ReactNode } from "react";

// A truthful empty/loading/error state with an optional next action. Every state
// names what happened and what to do next — never a bare blank or a bare "none".
export function StateBlock({
  title,
  body,
  action,
}: {
  title: string;
  body?: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded border border-dashed border-terminal-border bg-terminal-surface/40 px-6 py-10 text-center">
      <p className="font-display text-base font-semibold text-terminal-fg">{title}</p>
      {body && <p className="mx-auto mt-2 max-w-md font-sans text-sm text-terminal-muted">{body}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
