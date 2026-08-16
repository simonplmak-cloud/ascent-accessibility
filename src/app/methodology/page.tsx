import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Methodology",
  description:
    "How Ascent Accessibility scores a website — crawling, axe-core scanning, IBM Equal Access comparison, and the scoring model.",
};

export default function MethodologyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="font-mono text-3xl font-bold text-terminal-fg">Methodology</h1>
      <p className="mt-4 font-mono leading-7 text-terminal-muted">
        A transparent account of how the assessment works, so you know what a score means —
        and what it cannot tell you.
      </p>

      <h2 className="mt-8 font-mono text-xl font-semibold text-terminal-fg">1. Crawling</h2>
      <p className="mt-3 font-mono leading-7 text-terminal-muted">
        Whole-website scans start with the site&apos;s <code className="text-terminal-fg">sitemap.xml</code>,
        falling back to a link crawl, and respect <code className="text-terminal-fg">robots.txt</code>.
        Crawling is bounded by a depth and a page cap, so very large sites may be reported
        as covering a subset of pages.
      </p>

      <h2 className="mt-8 font-mono text-xl font-semibold text-terminal-fg">2. Scanning</h2>
      <p className="mt-3 font-mono leading-7 text-terminal-muted">
        Each page is scanned with axe-core, an open-source accessibility engine, against the
        rules for the standard you selected. axe-core detects only issues that can be
        identified automatically — roughly 30–50% of WCAG criteria. We also run the IBM
        Equal Access checker on each page and merge its findings as a second opinion.
      </p>

      <h2 className="mt-8 font-mono text-xl font-semibold text-terminal-fg">3. Scoring</h2>
      <p className="mt-3 font-mono leading-7 text-terminal-muted">
        The score starts at 100 and subtracts a fixed weight per finding — critical −10,
        serious −5, moderate −2, minor −0.5 — capped per finding. 90+ is a pass, 70–89 is
        partial, and below 70 is a fail. The conformance table separately tracks which
        success criteria pass, fail, are not applicable, or need manual review.
      </p>

      <h2 className="mt-8 font-mono text-xl font-semibold text-terminal-fg">4. Limitations</h2>
      <p className="mt-3 font-mono leading-7 text-terminal-muted">
        Automated tools cannot judge meaning, so many criteria (for example, whether alt
        text is accurate, or whether content is genuinely understandable) require human
        review. A clean score is encouraging, but it is not a certificate of conformance.
        Treat the report as a starting point for a manual review.
      </p>

      <p className="mt-8 font-mono text-sm text-terminal-fg">
        See the full list of{" "}
        <Link href="/standards" className="underline underline-offset-4 hover:text-terminal-serious">
          WCAG 2.2 success criteria
        </Link>{" "}
        the tool scores against.
      </p>
    </div>
  );
}
