import type { Metadata } from "next";
import { PageShell } from "@/components/ui/page-shell";
import { PageHeading } from "@/components/ui/page-heading";
import { MutedText } from "@/components/ui/text";
import { InlineLink } from "@/components/ui/inline-link";
import { LegalNote } from "@/components/legal/legal-note";

export const metadata: Metadata = {
  title: "Service commitment",
  description:
    "Ascent Accessibility's service commitment — availability target, support hours, and response expectations for subscribers.",
  alternates: { canonical: "/sla" },
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <>
      <h2 className="mt-8 font-mono text-xl font-semibold text-terminal-fg">{title}</h2>
      <p className="mt-3 font-mono leading-7 text-terminal-muted">{children}</p>
    </>
  );
}

export default function SlaPage() {
  return (
    <PageShell>
      <PageHeading>Service commitment</PageHeading>
      <MutedText className="mt-4">
        We are a small non-profit team, not a large software vendor. This page describes the
        level of service we aim to provide to subscribers — it is a commitment in spirit, not
        a contractual uptime guarantee.
      </MutedText>

      <Section title="Availability">
        We aim for high availability and monitor the assessment worker continuously. Scans
        run in a queue, so during busy periods a whole-website scan may wait before it
        starts. We do not commit to a specific uptime percentage.
      </Section>

      <Section title="Support">
        Support is by email at{" "}
        <a href="mailto:contact@ascent-partners.com" className="underline underline-offset-4 hover:text-terminal-fg">
          contact@ascent-partners.com
        </a>
        , generally during Hong Kong business hours (HKT). We aim to acknowledge reports of
        outages or billing problems within one business day. We cannot offer a guaranteed
        response-time or 24/7 coverage.
      </Section>

      <Section title="Maintenance">
        We may take the service offline briefly to deploy fixes and improvements. We do not
        typically announce maintenance windows in advance.
      </Section>

      <Section title="What we ask of you">
        Scans are intended for sites you own or are authorised to assess. Please keep your
        account and payment details current, and use the service in line with our{" "}
        <InlineLink href="/terms">terms of service</InlineLink>.
      </Section>

      <LegalNote label="service commitment" />
    </PageShell>
  );
}
