import type { Metadata } from "next";
import { PageShell } from "@/components/ui/page-shell";
import { PageHeading } from "@/components/ui/page-heading";
import { MutedText } from "@/components/ui/text";
import { Card } from "@/components/ui/card";
import { InlineLink } from "@/components/ui/inline-link";
import { ButtonLink } from "@/components/ui/button-link";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Ascent Accessibility pricing — free single-page assessments and a US$28/month subscription for whole-website scans and API access.",
  alternates: { canonical: "/pricing" },
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

function FeatureList({ items }: { items: string[] }) {
  return (
    <ul className="mt-4 space-y-2 font-mono text-sm text-terminal-muted">
      {items.map((item) => (
        <li key={item} className="flex gap-2">
          <span aria-hidden="true" className="text-terminal-pass">✓</span>
          {item}
        </li>
      ))}
    </ul>
  );
}

export default function PricingPage() {
  return (
    <PageShell width="4xl">
      <PageHeading>Pricing</PageHeading>
      <MutedText className="mt-4">
        One free tier, one simple subscription. No per-scan fees, no contracts — cancel
        any time from the billing portal.
      </MutedText>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h2 className="font-mono text-xl font-semibold text-terminal-fg">Free</h2>
          <p className="mt-1 font-mono text-3xl font-bold text-terminal-fg">
            US$0
            <span className="text-base font-normal text-terminal-muted"> / forever</span>
          </p>
          <FeatureList items={free} />
          <ButtonLink href="/assess" className="mt-6 inline-block">
            Assess a page for free
          </ButtonLink>
        </Card>

        <Card className="border-terminal-pass p-6">
          <h2 className="font-mono text-xl font-semibold text-terminal-fg">Whole-website</h2>
          <p className="mt-1 font-mono text-3xl font-bold text-terminal-fg">
            US$28
            <span className="text-base font-normal text-terminal-muted"> / month</span>
          </p>
          <FeatureList items={paid} />
          <ButtonLink href="/site" className="mt-6 inline-block">
            Subscribe
          </ButtonLink>
        </Card>
      </div>

      <p className="mt-8 font-mono text-sm text-terminal-muted">
        Billing is handled by Stripe. Prices are in US dollars and may be subject to local
        taxes. See our{" "}
        <InlineLink href="/terms">terms of service</InlineLink>
        ,{" "}
        <InlineLink href="/refund">refund policy</InlineLink>
        , and{" "}
        <InlineLink href="/sla">service commitment</InlineLink>
        .
      </p>
    </PageShell>
  );
}
