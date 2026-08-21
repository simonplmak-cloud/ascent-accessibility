import type { Metadata } from "next";
import { PageShell } from "@/components/ui/page-shell";
import { PageHeading } from "@/components/ui/page-heading";
import { InlineLink } from "@/components/ui/inline-link";
import { LegalNote } from "@/components/legal/legal-note";

export const metadata: Metadata = {
  title: "Refund and cancellation",
  description:
    "Cancelling or requesting a refund for an Ascent Accessibility subscription.",
  alternates: { canonical: "/refund" },
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <>
      <h2 className="mt-8 font-mono text-xl font-semibold text-terminal-fg">{title}</h2>
      <p className="mt-3 font-mono leading-7 text-terminal-muted">{children}</p>
    </>
  );
}

export default function RefundPage() {
  return (
    <PageShell>
      <PageHeading>Refund and cancellation</PageHeading>

      <Section title="Cancelling">
        You can cancel your subscription at any time from the{" "}
        <InlineLink href="/account">billing portal</InlineLink>{" "}
        (&ldquo;Manage subscription&rdquo;). Cancellation takes effect at the end of the
        current billing period — you keep whole-website and API access until then.
      </Section>

      <Section title="Refunds">
        Subscriptions are billed in advance. If you cancel within 14 days of a charge and
        have not made substantial use of whole-website scans or the API, contact us for a
        refund of that charge. We assess refunds case-by-case and may decline requests after
        substantial use.
      </Section>

      <Section title="Donations">
        Donations are voluntary contributions to Ascent Partners Foundation and are
        generally non-refundable. If you believe a donation was made in error, contact us
        promptly and we will review it.
      </Section>

      <Section title="Contact">
        Refund requests:{" "}
        <a href="mailto:contact@ascent-partners.com" className="underline underline-offset-4 hover:text-terminal-fg">
          contact@ascent-partners.com
        </a>
        .
      </Section>

      <LegalNote label="refund policy" />
    </PageShell>
  );
}
