import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Independent accessibility conformance assurance",
  description:
    "Automated scanning, AI-assisted review, and independent human review by experts with lived experience — an evidence-based WCAG conformance evaluation report for compliance and ESG teams.",
};

const cards = [
  {
    title: "Standard coverage",
    body: "WCAG 2.0, 2.1, 2.2 (A/AA/AAA) and Section 508, mapped to EN 301 549 and regional regulations.",
  },
  {
    title: "Evidence-based findings",
    body: "Every finding carries the affected element, page, and WCAG reference — an auditable record.",
  },
  {
    title: "Independent human expertise",
    body: "Criteria automation cannot resolve are reviewed by a paid workforce of people with lived experience — experts whose first-hand knowledge is the standard.",
  },
  {
    title: "Conformance evaluation report",
    body: "A signed, dated report structured as an assurance engagement, for due diligence and board reporting.",
  },
];

export default function Home() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <section className="max-w-2xl">
        <h1 className="font-mono text-4xl font-bold tracking-tight text-terminal-fg">
          Independent accessibility conformance assurance
        </h1>
        <p className="mt-4 font-mono text-lg text-terminal-muted">
          Automated scanning and AI-assisted review establish the baseline. Independent human
          review — by experts who live with visual, hearing, and motor disabilities and are paid for
          their insight — resolves what automation cannot, producing an evidence-based conformance
          evaluation report aligned to WCAG 2.2 and the regulations that reference it.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/assess"
            className="rounded bg-terminal-fg px-6 py-3 font-mono text-base font-medium text-terminal-bg hover:bg-terminal-serious"
          >
            Start an assessment
          </Link>
          <Link
            href="/human-review"
            className="rounded border border-terminal-border px-6 py-3 font-mono text-base font-medium text-terminal-fg hover:border-terminal-serious"
          >
            Request conformance review
          </Link>
        </div>
      </section>

      <section className="mt-20 grid gap-8 md:grid-cols-2" aria-label="What you get">
        {cards.map((card) => (
          <div key={card.title}>
            <h2 className="font-mono text-lg font-semibold text-terminal-fg">{card.title}</h2>
            <p className="mt-2 font-mono text-terminal-muted">{card.body}</p>
          </div>
        ))}
      </section>

      <section className="mt-20" aria-label="How it works">
        <h2 className="font-mono text-xl font-semibold text-terminal-fg">
          Three layers. One defensible result.
        </h2>
        <p className="mt-3 font-mono leading-7 text-terminal-muted">
          Automated → AI-assisted → independent human review. Most tools stop at automated
          detection and leave the remainder &ldquo;needs review&rdquo;. We close that gap and document it —
          so your accessibility position is auditable, not assumed.
        </p>
        <p className="mt-3 font-mono leading-7 text-terminal-muted">
          Digital accessibility is the &ldquo;S&rdquo; in ESG.{" "}
          <Link href="/esg" className="underline underline-offset-4 hover:text-terminal-fg">
            See how the report maps to GRI, ESRS, and SASB
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
