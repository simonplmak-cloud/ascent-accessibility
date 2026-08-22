import type { Metadata } from "next";
import { PageShell } from "@/components/ui/page-shell";
import { PageHeading } from "@/components/ui/page-heading";
import { MutedText } from "@/components/ui/text";
import { InlineLink } from "@/components/ui/inline-link";
import { ButtonLink } from "@/components/ui/button-link";

export const metadata: Metadata = {
  title: "For NGOs",
  description:
    "Free website accessibility checking for NGOs and community services — reach every person you serve, including people with disabilities. Free forever, no expertise needed.",
  alternates: { canonical: "/for-ngos" },
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="font-display text-xl font-semibold text-terminal-fg">{title}</h2>
      <div className="mt-3 font-sans leading-7 text-terminal-muted">{children}</div>
    </section>
  );
}

export default function ForNgosPage() {
  return (
    <PageShell width="3xl">
      <PageHeading>Accessibility for NGOs and community services</PageHeading>
      <MutedText className="mt-4">
        Reach every person you serve — including people with disabilities. Free forever, and you
        do not need to be a technical expert.
      </MutedText>

      <Section title="Your mission includes everyone">
        <p>
          The people you exist to help are often the people most affected by an inaccessible
          website. If someone cannot read your page with a screen reader, navigate it by keyboard,
          or understand your forms, they are cut off from your service. Accessibility is how you
          make sure no one is left out.
        </p>
      </Section>

      <Section title="Free forever — built for non-profit budgets">
        <p>
          Scanning is free, always. We are a registered charity, funded by donations (and, soon,
          paid independent review) — not by charging you for scans. There is no paywall and no
          trial that expires.
        </p>
      </Section>

      <Section title="Evidence your funders will value">
        <p>
          Digital inclusion is part of the &ldquo;social&rdquo; in ESG. A clear accessibility
          report shows funders and grant assessors that you take inclusion seriously — with
          evidence, not just intention.{" "}
          <InlineLink href="/esg">See how it maps to GRI, ESRS, and SASB</InlineLink>.
        </p>
      </Section>

      <Section title="What you get">
        <ul className="list-disc space-y-2 pl-6">
          <li>
            <span className="text-terminal-fg">A plain-language report</span> — a score and the top
            issues to fix first, in words anyone can follow.
          </li>
          <li>
            <span className="text-terminal-fg">A suggested fix</span> for each issue, with the
            evidence.
          </li>
          <li>
            <span className="text-terminal-fg">A free course</span> for your team, so you can keep
            your site accessible as it grows.
          </li>
        </ul>
      </Section>

      <Section title="Get started">
        <div className="flex flex-wrap gap-3">
          <ButtonLink href="/assess">Scan your site free</ButtonLink>
          <ButtonLink href="/training" variant="outline">
            Free team course
          </ButtonLink>
          <ButtonLink href="/what-is-accessibility" variant="outline">
            What is accessibility?
          </ButtonLink>
        </div>
      </Section>
    </PageShell>
  );
}
