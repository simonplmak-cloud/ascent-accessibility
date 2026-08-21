import type { Metadata } from "next";
import { PageShell } from "@/components/ui/page-shell";
import { PageHeading } from "@/components/ui/page-heading";
import { MutedText } from "@/components/ui/text";
import { InlineLink } from "@/components/ui/inline-link";

export const metadata: Metadata = {
  title: "Methodology",
  description:
    "How Ascent Accessibility scores a website — crawling, the Ascent Accessibility engine, site audit signals, and the scoring model.",
  alternates: { canonical: "/methodology" },
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <>
      <h2 className="mt-8 font-display text-xl font-semibold text-terminal-fg">{title}</h2>
      <p className="mt-3 font-sans leading-7 text-terminal-muted">{children}</p>
    </>
  );
}

export default function MethodologyPage() {
  return (
    <PageShell>
      <PageHeading>Methodology</PageHeading>
      <MutedText className="mt-4">
        A transparent account of how the assessment works, so you know what a score means —
        and what it cannot tell you.
      </MutedText>

      <Section title="1. Crawling">
        Whole-website scans start with the site&apos;s <code className="text-terminal-fg">sitemap.xml</code>,
        falling back to a link crawl, and respect <code className="text-terminal-fg">robots.txt</code>.
        Crawling is bounded by a depth and a page cap, so very large sites may be reported
        as covering a subset of pages.
      </Section>

      <Section title="2. Scanning">
        Each page is scanned with the Ascent Accessibility engine — an in-house,
        clean-room WCAG rule engine — against the rules for the standard you selected.
        Automated rules detect only issues that can be identified automatically, roughly
        30–50% of WCAG criteria. A companion site audit measures performance, SEO, and
        best-practice signals, and an optional AI-assisted review narrows the items that
        require manual judgement.
      </Section>

      <Section title="3. Scoring">
        The score starts at 100 and subtracts a fixed weight per finding — critical −10,
        serious −5, moderate −2, minor −0.5 — capped per finding. 90+ is a pass, 70–89 is
        partial, and below 70 is a fail. The conformance table separately tracks which
        success criteria pass, fail, are not applicable, or need manual review.
      </Section>

      <Section title="4. Limitations">
        Automated tools cannot judge meaning, so many criteria (for example, whether alt
        text is accurate, or whether content is genuinely understandable) require human
        review. A clean score is encouraging, but it is not a certificate of conformance.
        Treat the report as a starting point for a manual review.
      </Section>

      <p className="mt-8 font-sans text-sm text-terminal-fg">
        See the full list of{" "}
        <InlineLink href="/standards" className="hover:text-terminal-serious">
          WCAG 2.2 success criteria
        </InlineLink>{" "}
        the tool scores against.
      </p>
    </PageShell>
  );
}
