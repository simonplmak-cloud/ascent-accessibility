import Link from "next/link";
import type { Metadata } from "next";
import { LegalNote } from "@/components/legal/legal-note";

export const metadata: Metadata = {
  title: "Service commitment",
  description:
    "Ascent Accessibility's service commitment — availability target, support hours, and response expectations for subscribers.",
};

export default function SlaPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="font-mono text-3xl font-bold text-terminal-fg">Service commitment</h1>
      <p className="mt-4 font-mono leading-7 text-terminal-muted">
        We are a small non-profit team, not a large software vendor. This page describes the
        level of service we aim to provide to subscribers — it is a commitment in spirit, not
        a contractual uptime guarantee.
      </p>

      <h2 className="mt-8 font-mono text-xl font-semibold text-terminal-fg">Availability</h2>
      <p className="mt-3 font-mono leading-7 text-terminal-muted">
        We aim for high availability and monitor the assessment worker continuously. Scans
        run in a queue, so during busy periods a whole-website scan may wait before it
        starts. We do not commit to a specific uptime percentage.
      </p>

      <h2 className="mt-8 font-mono text-xl font-semibold text-terminal-fg">Support</h2>
      <p className="mt-3 font-mono leading-7 text-terminal-muted">
        Support is by email at{" "}
        <a href="mailto:contact@ascent-partners.com" className="underline underline-offset-4 hover:text-terminal-fg">
          contact@ascent-partners.com
        </a>
        , generally during Hong Kong business hours (HKT). We aim to acknowledge reports of
        outages or billing problems within one business day. We cannot offer a guaranteed
        response-time or 24/7 coverage.
      </p>

      <h2 className="mt-8 font-mono text-xl font-semibold text-terminal-fg">Maintenance</h2>
      <p className="mt-3 font-mono leading-7 text-terminal-muted">
        We may take the service offline briefly to deploy fixes and improvements. We do not
        typically announce maintenance windows in advance.
      </p>

      <h2 className="mt-8 font-mono text-xl font-semibold text-terminal-fg">What we ask of you</h2>
      <p className="mt-3 font-mono leading-7 text-terminal-muted">
        Scans are intended for sites you own or are authorised to assess. Please keep your
        account and payment details current, and use the service in line with our{" "}
        <Link href="/terms" className="underline underline-offset-4 hover:text-terminal-fg">
          terms of service
        </Link>
        .
      </p>

      <LegalNote label="service commitment" />
    </div>
  );
}
