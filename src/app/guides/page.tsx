import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/ui/page-shell";
import { PageHeading } from "@/components/ui/page-heading";
import { MutedText } from "@/components/ui/text";
import { ButtonLink } from "@/components/ui/button-link";

export const metadata: Metadata = {
  title: "Accessibility guides",
  description:
    "Plain-language guides to web accessibility, WCAG conformance reports, accessibility audits, VPAT verification, and ESG reporting — for NGOs and government.",
  alternates: { canonical: "/guides" },
};

const guides = [
  {
    href: "/guides/accessibility-audit",
    title: "What is an accessibility audit?",
    body: "What an audit is, the difference between automated and manual testing, and how to read the result.",
  },
  {
    href: "/guides/conformance-report",
    title: "What is a WCAG conformance report?",
    body: "What a conformance report contains, what 'passes / fails / needs review' means, and how to use it.",
  },
  {
    href: "/guides/vpat",
    title: "VPAT and ACR: third-party verification explained",
    body: "What a VPAT is, what an ACR is, and why independent verification matters for procurement.",
  },
  {
    href: "/guides/esg-accessibility",
    title: "Digital accessibility and ESG reporting",
    body: "How accessibility maps to the 'S' in ESG — GRI, ESRS, and SASB — and how to evidence it.",
  },
];

export default function GuidesPage() {
  return (
    <PageShell width="4xl">
      <PageHeading>Accessibility guides</PageHeading>
      <MutedText className="mt-4">
        Plain-language guides to understanding accessibility, audits, conformance reports, and
        verification — written for NGOs and government. New here? Start with{" "}
        <Link href="/what-is-accessibility" className="text-brandLink underline underline-offset-4 hover:text-brand">
          What is web accessibility?
        </Link>{" "}
        or the{" "}
        <Link href="/glossary" className="text-brandLink underline underline-offset-4 hover:text-brand">
          glossary
        </Link>
        .
      </MutedText>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        {guides.map((guide) => (
          <Link
            key={guide.href}
            href={guide.href}
            className="rounded border border-terminal-border bg-terminal-surface/40 p-5 hover:border-terminal-serious"
          >
            <h2 className="font-display text-lg font-semibold text-terminal-fg">{guide.title}</h2>
            <p className="mt-2 font-sans text-sm text-terminal-muted">{guide.body}</p>
            <p className="mt-3 font-sans text-xs text-brandLink">Read the guide →</p>
          </Link>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <ButtonLink href="/assess">Scan your site free</ButtonLink>
        <ButtonLink href="/training" variant="outline">
          Take the free course
        </ButtonLink>
      </div>
    </PageShell>
  );
}
