export function LegalNote({ label = "terms" }: { label?: string }) {
  return (
    <p className="mt-6 rounded border border-terminal-border bg-terminal-surface p-3 font-mono text-sm text-terminal-muted">
      This {label} is a draft prepared for review by Ascent Partners Foundation&apos;s
      legal counsel. It is not yet in force.
    </p>
  );
}
