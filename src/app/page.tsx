import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free WCAG 2.2 AA Accessibility Assessment",
  description:
    "Run a free accessibility assessment against WCAG 2.2 AA. Get a score, concrete findings, and remediation guidance — no login required.",
};

export default function Home() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <section className="max-w-2xl">
        <h1 className="font-mono text-4xl font-bold tracking-tight text-terminal-fg">
          Measure your website&apos;s accessibility
        </h1>
        <p className="mt-4 font-mono text-lg text-terminal-muted">
          Run a free accessibility assessment against WCAG 2.2 AA. Get a score, concrete
          findings, and remediation guidance — no login required.
        </p>
        <div className="mt-8">
          <Link
            href="/assess"
            className="rounded bg-terminal-fg px-6 py-3 font-mono text-base font-medium text-terminal-bg hover:bg-terminal-serious"
          >
            Assess your site
          </Link>
        </div>
      </section>

      <section className="mt-20 grid gap-8 md:grid-cols-3" aria-label="What you get">
        <div>
          <h2 className="font-mono text-lg font-semibold text-terminal-fg">Assessment findings</h2>
          <p className="mt-2 font-mono text-terminal-muted">
            Detailed violations with the rule, impact level, and affected page.
          </p>
        </div>
        <div>
          <h2 className="font-mono text-lg font-semibold text-terminal-fg">Recommendations</h2>
          <p className="mt-2 font-mono text-terminal-muted">
            Actionable remediation guidance for every finding.
          </p>
        </div>
        <div>
          <h2 className="font-mono text-lg font-semibold text-terminal-fg">A clear score</h2>
          <p className="mt-2 font-mono text-terminal-muted">
            An overall 0–100 score with a pass, partial, or fail result.
          </p>
        </div>
      </section>
    </div>
  );
}
