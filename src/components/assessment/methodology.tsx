import Link from "next/link";
import type { AssessmentResult } from "./types";

export function Methodology({ result }: { result: AssessmentResult }) {
  return (
    <section aria-labelledby="methodology-heading" className="mt-8">
      <h2 id="methodology-heading" className="font-display text-lg font-semibold text-terminal-fg">
        Methodology
      </h2>
      <ul className="mt-2 list-disc space-y-1 pl-6 font-sans text-sm text-terminal-muted">
        <li>Engine: the Ascent Accessibility engine, with a companion site audit and AI-assisted review.</li>
        <li>Standard: {result.standard ?? "—"}</li>
        <li>Pages scanned: {result.pagesScanned}</li>
        <li>Rendered in a headless Chromium browser via a remote CDP endpoint.</li>
        <li>
          Findings chain to WCAG 2.2 success criteria with code and screenshot evidence where
          available.
        </li>
        <li>
          Reproducible for a fixed page snapshot; re-scanning a live site may legitimately
          differ (dynamic content, network timing, crawl limits).
        </li>
      </ul>
      <p className="mt-3 font-sans text-sm text-terminal-muted">
        Read the full{" "}
        <Link href="/methodology" className="text-brandLink underline underline-offset-4 hover:text-brand">
          methodology
        </Link>
        ,{" "}
        <Link href="/validation" className="text-brandLink underline underline-offset-4 hover:text-brand">
          how we validate the engine
        </Link>
        , and{" "}
        <Link href="/human-review" className="text-brandLink underline underline-offset-4 hover:text-brand">
          independent human review
        </Link>
        .
      </p>
    </section>
  );
}
