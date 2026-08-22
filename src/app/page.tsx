import Link from "next/link";
import type { Metadata } from "next";
import { getSessionUser } from "@/server/auth";
import { assessmentRepository } from "@/db/repository";

export const metadata: Metadata = {
  title: "Is your website accessible to everyone?",
  description:
    "A free website accessibility checker for NGOs and government. Enter your web address and get a clear, plain-language report of what to fix. Free forever.",
};

const steps = [
  { n: 1, title: "Enter your web address", body: "Paste the URL of the page or site you want to check." },
  { n: 2, title: "We scan it — free", body: "Our engine checks your pages against WCAG, the web accessibility standard." },
  { n: 3, title: "Get a clear report", body: "A plain-language report of what to fix first, and how to fix it." },
];

const sampleIssues = [
  { impact: "critical", text: "Images have no text alternative", sc: "1.1.1", by: "Machine" },
  { impact: "serious", text: "Text colour contrast is too low", sc: "1.4.3", by: "Machine" },
  { impact: "needs human", text: "Keyboard focus is not visible", sc: "2.4.7", by: "Needs human" },
];

const personas = [
  { title: "Government digital & policy teams", body: "Meet WCAG AA requirements with independent evidence — not just a self-declared statement.", href: "/for-government" },
  { title: "NGOs & community services", body: "Reach every person you serve — including people with disabilities.", href: "/for-ngos" },
  { title: "Funders & grant assessors", body: "Get verifiable accessibility evidence for due diligence.", href: "/esg" },
  { title: "Developers & auditors", body: "Prioritised findings with a suggested fix, evidence, and how each was tested.", href: "/training" },
];

const outcomes = [
  { title: "Reach everyone", body: "WCAG 2.0, 2.1, 2.2 (A/AA/AAA) and Section 508, mapped to EN 301 549 and regional regulations." },
  { title: "Evidence you can defend", body: "Every finding carries the affected element, page, and WCAG reference — an auditable record." },
  { title: "Independent human review — coming soon", body: "People with lived experience of disability will verify what automation cannot. We are building that review workforce now." },
  { title: "A report you can act on", body: "Signed, dated, and ranked by what to fix first — with a suggested fix for each issue." },
];

const trustPoints = [
  "Independent human review is coming soon — we are building a review workforce with charities that serve people with visual and hearing disabilities.",
  "Free forever — funded by donations, not by charging for scans.",
  "We hold ourselves to the same standard — this site targets WCAG 2.2 AAA.",
  "Open about how it works — read our methodology and how we validate the engine.",
];

const impactClass: Record<string, string> = {
  critical: "text-terminal-critical",
  serious: "text-terminal-serious",
  "needs human": "text-terminal-moderate",
};

export default async function Home() {
  // A1: a signed-in returning user gets a one-click path back to their latest report.
  // Fail-open: if the database is unreachable we simply hide the link.
  const user = await getSessionUser();
  let latestReportHref: string | null = null;
  if (user) {
    try {
      const assessments = await assessmentRepository.list(user.id, 20);
      const latestCompleted = assessments.find((a) => a.status === "completed");
      if (latestCompleted) {
        latestReportHref = `/auditor/report/${encodeURIComponent(latestCompleted.id)}`;
      }
    } catch {
      latestReportHref = null;
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      {/* 1 · Hero */}
      <section className="max-w-2xl">
        <h1 className="font-display text-4xl font-bold tracking-tight text-terminal-fg">
          Is your website accessible to everyone?
        </h1>
        <p className="mt-4 font-sans text-lg text-terminal-muted">
          A free website accessibility checker for NGOs and government. Enter your web address and
          get a clear, plain-language report of what to fix. No expertise needed. Free forever.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/assess"
            className="rounded bg-terminal-fg px-6 py-3 font-sans text-base font-medium text-terminal-bg hover:bg-terminal-serious"
          >
            Scan your site free
          </Link>
          <a
            href="#sample-report"
            className="rounded border border-terminal-border px-6 py-3 font-sans text-base font-medium text-terminal-fg hover:border-terminal-serious"
          >
            See a sample report
          </a>
        </div>
        {latestReportHref && (
          <p className="mt-4 font-sans text-sm text-terminal-muted">
            Welcome back —{" "}
            <Link
              href={latestReportHref}
              className="text-brandLink underline underline-offset-4 hover:text-brand"
            >
              view your latest report →
            </Link>
          </p>
        )}
      </section>

      {/* 2 · The difference */}
      <section className="mt-20" aria-labelledby="difference">
        <h2 id="difference" className="font-display text-2xl font-semibold text-terminal-fg">
          More than a scan
        </h2>
        <p className="mt-3 max-w-3xl font-sans leading-7 text-terminal-muted">
          Most tools only run automated checks and mark the rest &ldquo;needs review&rdquo;. We go
          further. Automated scanning finds the clear issues. AI-assisted review helps with the
          rest. And independent human review by people with lived experience of disability —
          launching soon — will confirm what machines cannot, producing a signed, evidence-based
          report, not just a list of errors.
        </p>
      </section>

      {/* 3 · How it works */}
      <section className="mt-20" aria-labelledby="how">
        <h2 id="how" className="font-display text-2xl font-semibold text-terminal-fg">
          How it works
        </h2>
        <ol className="mt-6 grid gap-6 sm:grid-cols-3">
          {steps.map((step) => (
            <li key={step.n} className="rounded border border-terminal-border bg-terminal-surface/40 p-4">
              <p className="font-display text-2xl font-bold text-brand">{step.n}</p>
              <h3 className="mt-1 font-display text-base font-semibold text-terminal-fg">{step.title}</h3>
              <p className="mt-1 font-sans text-sm text-terminal-muted">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* 4 · Sample report */}
      <section id="sample-report" className="mt-20 scroll-mt-24" aria-labelledby="sample">
        <h2 id="sample" className="font-display text-2xl font-semibold text-terminal-fg">
          See a sample report
        </h2>
        <div className="mt-6 max-w-2xl rounded border border-terminal-border bg-terminal-surface p-5 shadow-card">
          <div className="flex flex-wrap items-baseline gap-3">
            <p className="font-display text-3xl font-bold text-terminal-fg">
              72<span className="text-lg text-terminal-muted">/100</span>
            </p>
            <p className="font-sans text-sm font-medium text-terminal-serious">Partial — needs work</p>
          </div>
          <p className="mt-1 font-sans text-xs text-terminal-muted">Top issues to fix first</p>
          <ul className="mt-3 space-y-2">
            {sampleIssues.map((issue) => (
              <li
                key={issue.sc}
                className="flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded border border-terminal-border px-3 py-2"
              >
                <span className={`font-sans text-xs font-semibold uppercase ${impactClass[issue.impact]}`}>
                  {issue.impact}
                </span>
                <span className="font-sans text-sm text-terminal-fg">{issue.text}</span>
                <span className="font-sans text-xs text-terminal-muted">WCAG {issue.sc}</span>
                <span className="ml-auto font-sans text-xs text-terminal-muted">{issue.by}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 font-sans text-xs text-terminal-muted">
            An example report. Yours shows a score, the top issues to fix first, and how each was
            tested — machine, AI, or human review.
          </p>
        </div>
      </section>

      {/* 5 · Who it's for */}
      <section className="mt-20" aria-labelledby="who">
        <h2 id="who" className="font-display text-2xl font-semibold text-terminal-fg">
          Who it&rsquo;s for
        </h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {personas.map((persona) => (
            <Link
              key={persona.title}
              href={persona.href}
              className="rounded border border-terminal-border bg-terminal-surface/40 p-4 hover:border-terminal-serious"
            >
              <h3 className="font-display text-base font-semibold text-terminal-fg">{persona.title}</h3>
              <p className="mt-1 font-sans text-sm text-terminal-muted">{persona.body}</p>
              <p className="mt-2 font-sans text-xs text-brandLink">Learn more →</p>
            </Link>
          ))}
        </div>
      </section>

      {/* 6 · What you get */}
      <section className="mt-20" aria-labelledby="outcomes">
        <h2 id="outcomes" className="font-display text-2xl font-semibold text-terminal-fg">
          What you get
        </h2>
        <div className="mt-6 grid gap-8 md:grid-cols-2">
          {outcomes.map((outcome) => (
            <div key={outcome.title}>
              <h3 className="font-display text-lg font-semibold text-terminal-fg">{outcome.title}</h3>
              <p className="mt-2 font-sans text-terminal-muted">{outcome.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 7 · Why you can trust it */}
      <section className="mt-20" aria-labelledby="trust">
        <h2 id="trust" className="font-display text-2xl font-semibold text-terminal-fg">
          Why you can trust it
        </h2>
        <ul className="mt-6 max-w-3xl space-y-3">
          {trustPoints.map((point) => (
            <li key={point} className="flex gap-3 font-sans leading-7 text-terminal-muted">
              <span aria-hidden="true" className="text-terminal-pass">✓</span>
              {point}
            </li>
          ))}
        </ul>
      </section>

      {/* 8 · From our founder */}
      <section className="mt-20 rounded border border-terminal-border bg-terminal-surface/40 p-6" aria-labelledby="founder">
        <h2 id="founder" className="font-display text-2xl font-semibold text-terminal-fg">
          From our founder
        </h2>
        <p className="mt-3 max-w-3xl font-sans leading-7 text-terminal-muted">
          Simon Mak is an entrepreneur, author, and sustainability advocate — and he lives with
          Parkinson&rsquo;s disease. He founded Ascent Partners Foundation because accessibility is
          not an abstract cause to him; it is personal. That is why this tool is built by people
          with lived experience of disability — from our founder to the review workforce we are
          building with disability-serving charities — for everyone who is too often excluded from
          the web.
        </p>
        <p className="mt-3 max-w-3xl font-sans leading-7 text-terminal-muted">
          His work connects finance and sustainability — and digital accessibility is the
          &ldquo;social&rdquo; in ESG.{" "}
          <Link href="/esg" className="text-brandLink underline underline-offset-4 hover:text-brand">
            See how the report maps to GRI, ESRS, and SASB
          </Link>
          {" · "}
          <a
            href="https://www.simonmak.com"
            target="_blank"
            rel="noreferrer"
            className="text-brandLink underline underline-offset-4 hover:text-brand"
          >
            simonmak.com<span className="sr-only"> (opens in a new window)</span>
          </a>
          .
        </p>
      </section>

      {/* 9 · Trust strip + closing CTA */}
      <section className="mt-20 border-t border-terminal-border pt-10" aria-labelledby="learn-more">
        <h2 id="learn-more" className="sr-only">
          Learn more and get started
        </h2>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="font-sans text-sm text-terminal-muted">
            <Link href="/methodology" className="text-brandLink underline underline-offset-4 hover:text-brand">Methodology</Link>{" · "}
            <Link href="/guides" className="text-brandLink underline underline-offset-4 hover:text-brand">Guides</Link>{" · "}
            <Link href="/glossary" className="text-brandLink underline underline-offset-4 hover:text-brand">Glossary</Link>{" · "}
            <Link href="/validation" className="text-brandLink underline underline-offset-4 hover:text-brand">Engine validation</Link>{" · "}
            <Link href="/accessibility-statement" className="text-brandLink underline underline-offset-4 hover:text-brand">Accessibility</Link>{" · "}
            <Link href="/human-review" className="text-brandLink underline underline-offset-4 hover:text-brand">Human review</Link>{" · "}
            <Link href="/privacy" className="text-brandLink underline underline-offset-4 hover:text-brand">Privacy</Link>
          </p>
          <Link
            href="/assess"
            className="rounded bg-terminal-fg px-6 py-3 font-sans text-base font-medium text-terminal-bg hover:bg-terminal-serious"
          >
            Scan your site free
          </Link>
        </div>
      </section>
    </div>
  );
}
