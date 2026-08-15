import Link from "next/link";

export default function WcagLearnPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="font-mono text-3xl font-bold text-terminal-fg">How WCAG 2.2 works</h1>

      <h2 className="mt-8 font-mono text-xl font-semibold text-terminal-fg">
        The four principles (POUR)
      </h2>
      <ul className="mt-3 space-y-2 font-mono text-terminal-muted">
        <li><strong className="text-terminal-fg">Perceivable</strong> — content is available to the senses (sight, hearing, touch).</li>
        <li><strong className="text-terminal-fg">Operable</strong> — interface works by keyboard and other inputs, not just a mouse.</li>
        <li><strong className="text-terminal-fg">Understandable</strong> — content and controls are predictable and clear.</li>
        <li><strong className="text-terminal-fg">Robust</strong> — content works with current and future assistive technologies.</li>
      </ul>

      <h2 className="mt-8 font-mono text-xl font-semibold text-terminal-fg">Levels (A, AA, AAA)</h2>
      <p className="mt-3 font-mono text-terminal-muted">
        Success criteria are grouped into three conformance levels. Level A is the minimum
        barrier-removal, AA is the common legal and best-practice target, and AAA is the
        highest — the strictest success criteria. Level AA includes all Level A criteria;
        AAA includes all A and AA.
      </p>

      <h2 className="mt-8 font-mono text-xl font-semibold text-terminal-fg">Versions</h2>
      <p className="mt-3 font-mono text-terminal-muted">
        WCAG 2.2 (the current standard) extends 2.1, which extended 2.0. WCAG 2.2 added nine
        success criteria, including Focus Not Obscured (2.4.11), Dragging Movements (2.5.7),
        Target Size (2.5.8), Consistent Help (3.2.6), Redundant Entry (3.3.7), and Accessible
        Authentication (3.3.8).
      </p>

      <h2 className="mt-8 font-mono text-xl font-semibold text-terminal-fg">
        Conformance level vs. defect severity
      </h2>
      <p className="mt-3 font-mono text-terminal-muted">
        The level (A/AA/AAA) tells you how strict a criterion is. It is <em>not</em> the same
        as the impact of a specific violation. A Level A failure can be minor in practice,
        and a Level AA failure can block a user completely. See{" "}
        <Link href="/learn/severity" className="underline underline-offset-4 hover:text-terminal-fg">
          understanding severity
        </Link>{" "}
        for how we grade impact.
      </p>
    </div>
  );
}
