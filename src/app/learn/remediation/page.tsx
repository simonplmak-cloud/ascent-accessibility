const examples = [
  {
    title: "Button without an accessible name",
    before: '<div class="close" onclick="closeDialog()">×</div>',
    after: '<button type="button" class="close" aria-label="Close dialog">\n  <span aria-hidden="true">×</span>\n</button>',
    note: "The native button is keyboard-operable and announced as “Close dialog, button”.",
  },
  {
    title: "Image without alternative text",
    before: '<img src="chart.png">',
    after: '<img src="chart.png" alt="Quarterly revenue up 12% from Q2 to Q3">',
    note: "Decorative images should use alt=\"\" instead so screen readers skip them.",
  },
  {
    title: "Low-contrast text",
    before: "color: #888 on a white background (≈3.5:1)",
    after: "color: #595959 on a white background (≥7:1, AAA)",
    note: "Aim for at least 4.5:1 (AA) or 7:1 (AAA) between text and its background.",
  },
];

export default function RemediationLearnPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="font-mono text-3xl font-bold text-terminal-fg">Remediation examples</h1>
      <p className="mt-4 font-mono text-terminal-muted">
        Before/after fixes for common failures. Always verify the fix by keyboard and with a
        screen reader, not just visually.
      </p>

      <div className="mt-8 space-y-6">
        {examples.map((example) => (
          <section key={example.title} className="rounded border border-terminal-border bg-terminal-surface p-4">
            <h2 className="font-mono text-lg font-semibold text-terminal-fg">{example.title}</h2>
            <p className="mt-2 font-mono text-xs uppercase text-terminal-muted">Before</p>
            <pre className="mt-1 overflow-x-auto rounded bg-terminal-bg p-3 font-mono text-xs text-terminal-critical">{example.before}</pre>
            <p className="mt-2 font-mono text-xs uppercase text-terminal-muted">After</p>
            <pre className="mt-1 overflow-x-auto rounded bg-terminal-bg p-3 font-mono text-xs text-terminal-pass">{example.after}</pre>
            <p className="mt-2 font-mono text-sm text-terminal-muted">{example.note}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
