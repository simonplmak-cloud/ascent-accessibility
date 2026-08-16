import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Ascent Accessibility pricing — free single-page assessments and a US$28/month subscription for whole-website scans and API access.",
};

const free = [
  "Single-page assessment — no account required",
  "WCAG 2.2 A/AA/AAA, 2.1 and 2.0, plus Section 508",
  "Overall 0–100 score with pass / partial / fail",
  "Findings with impact, affected elements, and pages",
  "Plain-language remediation guidance for every finding",
  "Evidence screenshots of each violation",
];

const paid = [
  "Everything in the free tier",
  "Whole-website scans — full sitemap and link crawl",
  "Conformance table across all applicable success criteria",
  "IBM Equal Access comparison on every page",
  "Downloadable PDF and CSV reports",
  "API access for programmatic assessments",
  "Your scan history, saved across visits",
];

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="font-mono text-3xl font-bold text-terminal-fg">Pricing</h1>
      <p className="mt-4 font-mono leading-7 text-terminal-muted">
        One free tier, one simple subscription. No per-scan fees, no contracts — cancel
        any time from the billing portal.
      </p>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <section
          aria-labelledby="free-heading"
          className="rounded border border-terminal-border bg-terminal-surface p-6"
        >
          <h2 id="free-heading" className="font-mono text-xl font-semibold text-terminal-fg">
            Free
          </h2>
          <p className="mt-1 font-mono text-3xl font-bold text-terminal-fg">
            US$0
            <span className="text-base font-normal text-terminal-muted"> / forever</span>
          </p>
          <ul className="mt-4 space-y-2 font-mono text-sm text-terminal-muted">
            {free.map((item) => (
              <li key={item} className="flex gap-2">
                <span aria-hidden="true" className="text-terminal-pass">✓</span>
                {item}
              </li>
            ))}
          </ul>
          <Link
            href="/assess"
            className="mt-6 inline-block rounded bg-terminal-fg px-4 py-2 font-mono text-sm text-terminal-bg hover:bg-terminal-serious"
          >
            Assess a page for free
          </Link>
        </section>

        <section
          aria-labelledby="paid-heading"
          className="rounded border border-terminal-pass bg-terminal-surface p-6"
        >
          <h2 id="paid-heading" className="font-mono text-xl font-semibold text-terminal-fg">
            Whole-website
          </h2>
          <p className="mt-1 font-mono text-3xl font-bold text-terminal-fg">
            US$28
            <span className="text-base font-normal text-terminal-muted"> / month</span>
          </p>
          <ul className="mt-4 space-y-2 font-mono text-sm text-terminal-muted">
            {paid.map((item) => (
              <li key={item} className="flex gap-2">
                <span aria-hidden="true" className="text-terminal-pass">✓</span>
                {item}
              </li>
            ))}
          </ul>
          <Link
            href="/site"
            className="mt-6 inline-block rounded bg-terminal-fg px-4 py-2 font-mono text-sm text-terminal-bg hover:bg-terminal-serious"
          >
            Subscribe
          </Link>
        </section>
      </div>

      <p className="mt-8 font-mono text-sm text-terminal-muted">
        Billing is handled by Stripe. Prices are in US dollars and may be subject to local
        taxes. See our{" "}
        <Link href="/terms" className="underline underline-offset-4 hover:text-terminal-fg">
          terms of service
        </Link>
        ,{" "}
        <Link href="/refund" className="underline underline-offset-4 hover:text-terminal-fg">
          refund policy
        </Link>
        , and{" "}
        <Link href="/sla" className="underline underline-offset-4 hover:text-terminal-fg">
          service commitment
        </Link>
        .
      </p>
    </div>
  );
}
