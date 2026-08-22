import type { Metadata } from "next";
import { PageShell } from "@/components/ui/page-shell";
import { PageHeading } from "@/components/ui/page-heading";
import { MutedText } from "@/components/ui/text";
import { InlineLink } from "@/components/ui/inline-link";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact Ascent Partners Foundation about the accessibility assessment tool.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <PageShell>
      <PageHeading>Contact us</PageHeading>
      <MutedText className="mt-4">
        Want help improving your accessibility, or a deeper audit of your site? Get in
        touch.
      </MutedText>
      <address className="mt-6 not-italic font-sans text-terminal-fg">
        <p>
          Email:{" "}
          <a href="mailto:contact@ascent-partners.com" className="underline underline-offset-4">
            contact@ascent-partners.com
          </a>
        </p>
        <p className="mt-2">
          Website:{" "}
          <a
            href="https://www.ascent.partners"
            className="underline underline-offset-4"
            target="_blank"
            rel="noopener noreferrer"
          >
            www.ascent.partners<span className="sr-only"> (opens in a new window)</span>
          </a>
        </p>
      </address>
    </PageShell>
  );
}
