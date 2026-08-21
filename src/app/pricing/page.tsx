import type { Metadata } from "next";
import { PageShell } from "@/components/ui/page-shell";
import { PageHeading } from "@/components/ui/page-heading";
import { MutedText } from "@/components/ui/text";
import { Card } from "@/components/ui/card";
import { InlineLink } from "@/components/ui/inline-link";
import { ButtonLink } from "@/components/ui/button-link";

export const metadata: Metadata = {
  title: "Plans",
  description:
    "Ascent Accessibility is free to use. Single-page and whole-site scans are free for verified accounts; AI-assisted review is bring-your-own-key, and human review is billed per page.",
  alternates: { canonical: "/pricing" },
};

const free = [
  "Single-page and whole-website scans — no charge",
  "WCAG 2.2 A/AA/AAA, 2.1 and 2.0, plus Section 508",
  "Conformance outcome with 'x of y applicable SCs meet'",
  "Findings with impact, affected elements, and pages",
  "Plain-language remediation guidance for every finding",
  "Evidence screenshots of each violation",
];

const byok = [
  "AI-assisted review of criteria automation cannot resolve",
  "Bring your own key for OpenRouter, OpenAI, Qwen, Gemini, or Anthropic — or any OpenAI-compatible endpoint",
  "Fail-safe: nothing is marked passed without high confidence",
  "Covered by your existing key; no per-scan fee",
];

const human = [
  "Independent review by a paid workforce of people with lived experience",
  "Resolves every 'Cannot tell' criterion with a written rationale",
  "A signed, dated conformance evaluation report (in-app + PDF)",
  "VPAT/ACR export for procurement",
  "Billed per page — contact us for a quote",
];

export default function PricingPage() {
  return (
    <PageShell width="4xl">
      <PageHeading>Plans</PageHeading>
      <MutedText className="mt-4">
        The assessment is free for everyone. We fund it through donations and paid human review —
        not by charging for scans.
      </MutedText>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        <Card className="p-6">
          <h2 className="font-display text-xl font-semibold text-terminal-fg">Free</h2>
          <p className="mt-1 font-display text-3xl font-bold text-terminal-fg">
            US$0
            <span className="text-base font-normal text-terminal-muted"> / always</span>
          </p>
          <ul className="mt-4 space-y-2 font-sans text-sm text-terminal-muted">
            {free.map((item) => (
              <li key={item} className="flex gap-2">
                <span aria-hidden="true" className="text-terminal-pass">✓</span>
                {item}
              </li>
            ))}
          </ul>
          <ButtonLink href="/assess" className="mt-6 inline-block">
            Start an assessment
          </ButtonLink>
        </Card>

        <Card className="p-6">
          <h2 className="font-display text-xl font-semibold text-terminal-fg">AI-assisted review</h2>
          <p className="mt-1 font-display text-3xl font-bold text-terminal-fg">BYOK</p>
          <ul className="mt-4 space-y-2 font-sans text-sm text-terminal-muted">
            {byok.map((item) => (
              <li key={item} className="flex gap-2">
                <span aria-hidden="true" className="text-terminal-pass">✓</span>
                {item}
              </li>
            ))}
          </ul>
          <ButtonLink href="/assess" className="mt-6 inline-block">
            Whole-website scan
          </ButtonLink>
        </Card>

        <Card className="border-terminal-pass p-6">
          <h2 className="font-display text-xl font-semibold text-terminal-fg">Human review</h2>
          <p className="mt-1 font-display text-3xl font-bold text-terminal-fg">
            Per page
            <span className="text-base font-normal text-terminal-muted"> · quoted</span>
          </p>
          <ul className="mt-4 space-y-2 font-sans text-sm text-terminal-muted">
            {human.map((item) => (
              <li key={item} className="flex gap-2">
                <span aria-hidden="true" className="text-terminal-pass">✓</span>
                {item}
              </li>
            ))}
          </ul>
          <ButtonLink href="/contact" className="mt-6 inline-block">
            Request a quote
          </ButtonLink>
        </Card>
      </div>

      <p className="mt-8 font-sans text-sm text-terminal-muted">
        Prefer to support the service?{" "}
        <InlineLink href="/donate">Make a donation</InlineLink> — it keeps the scans free. See our{" "}
        <InlineLink href="/terms">terms</InlineLink>,{" "}
        <InlineLink href="/refund">refund policy</InlineLink>, and{" "}
        <InlineLink href="/sla">service commitment</InlineLink>.
      </p>
    </PageShell>
  );
}
