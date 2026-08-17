import Link from "next/link";
import type { Metadata } from "next";
import { LegalNote } from "@/components/legal/legal-note";

export const metadata: Metadata = {
  title: "Refund and cancellation",
  description:
    "Cancelling or requesting a refund for an Ascent Accessibility subscription.",
};

export default function RefundPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="font-mono text-3xl font-bold text-terminal-fg">Refund and cancellation</h1>

      <h2 className="mt-8 font-mono text-xl font-semibold text-terminal-fg">Cancelling</h2>
      <p className="mt-3 font-mono leading-7 text-terminal-muted">
        You can cancel your subscription at any time from the{" "}
        <Link href="/site" className="underline underline-offset-4 hover:text-terminal-fg">
          billing portal
        </Link>{" "}
        (&ldquo;Manage subscription&rdquo;). Cancellation takes effect at the end of the
        current billing period — you keep whole-website and API access until then.
      </p>

      <h2 className="mt-8 font-mono text-xl font-semibold text-terminal-fg">Refunds</h2>
      <p className="mt-3 font-mono leading-7 text-terminal-muted">
        Subscriptions are billed in advance. If you cancel within 14 days of a charge and
        have not made substantial use of whole-website scans or the API, contact us for a
        refund of that charge. We assess refunds case-by-case and may decline requests after
        substantial use.
      </p>

      <h2 className="mt-8 font-mono text-xl font-semibold text-terminal-fg">Donations</h2>
      <p className="mt-3 font-mono leading-7 text-terminal-muted">
        Donations are voluntary contributions to Ascent Partners Foundation and are
        generally non-refundable. If you believe a donation was made in error, contact us
        promptly and we will review it.
      </p>

      <h2 className="mt-8 font-mono text-xl font-semibold text-terminal-fg">Contact</h2>
      <p className="mt-3 font-mono leading-7 text-terminal-muted">
        Refund requests:{" "}
        <a href="mailto:contact@ascent-partners.com" className="underline underline-offset-4 hover:text-terminal-fg">
          contact@ascent-partners.com
        </a>
        .
      </p>

      <LegalNote label="refund policy" />
    </div>
  );
}
