"use client";

export interface BulkAction {
  id: string;
  label: string;
  run: () => void;
  destructive?: boolean;
}

export function BulkActionBar({
  count,
  actions,
  onUndo,
}: {
  count: number;
  actions: BulkAction[];
  onUndo?: () => void;
}) {
  if (count === 0) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-wrap items-center gap-3 rounded border border-terminal-fg/40 bg-terminal-surface px-3 py-2"
    >
      <span className="font-mono text-sm text-terminal-fg">{count} selected</span>
      <div className="flex flex-wrap gap-2">
        {actions.map((action) => (
          <button
            key={action.id}
            type="button"
            onClick={action.run}
            className={`rounded border px-3 py-1 font-mono text-sm ${
              action.destructive
                ? "border-terminal-critical text-terminal-critical hover:bg-terminal-critical hover:text-terminal-bg"
                : "border-terminal-border text-terminal-fg hover:bg-terminal-fg hover:text-terminal-bg"
            }`}
          >
            {action.label}
          </button>
        ))}
        {onUndo && (
          <button
            type="button"
            onClick={onUndo}
            className="rounded border border-terminal-border px-3 py-1 font-mono text-sm text-terminal-muted hover:text-terminal-fg"
          >
            Undo
          </button>
        )}
      </div>
    </div>
  );
}
