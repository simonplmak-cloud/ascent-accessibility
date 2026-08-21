import type { Metadata } from "next";
import { PageShell } from "@/components/ui/page-shell";
import { PageHeading } from "@/components/ui/page-heading";
import { MutedText } from "@/components/ui/text";
import { InlineLink } from "@/components/ui/inline-link";

export const metadata: Metadata = {
  title: "Accessibility statement",
  description:
    "Ascent Accessibility's commitment to accessibility — the standard we design to, and how to report a problem.",
  alternates: { canonical: "/accessibility-statement" },
};

export default function AccessibilityStatementPage() {
  return (
    <PageShell>
      <PageHeading>Accessibility statement</PageHeading>
      <MutedText className="mt-4">
        Ascent Partners Foundation is committed to making this site usable by everyone. We
        design it alongside screen-reader and keyboard users, not as an afterthought.
      </MutedText>

      <h2 className="mt-8 font-display text-xl font-semibold text-terminal-fg">Our target</h2>
      <p className="mt-3 font-sans leading-7 text-terminal-muted">
        We aim for WCAG 2.2 AAA — a stricter standard than the AA level the assessment tool
        defaults to. The interface uses a high-contrast monospace theme, a single ordered
        heading outline, standard landmarks, a skip link, visible focus, labelled form
        fields, and live announcements for dynamic changes. You can adjust text size from
        the header.
      </p>

      <h2 className="mt-8 font-display text-xl font-semibold text-terminal-fg">Known limitations</h2>
      <p className="mt-3 font-sans leading-7 text-terminal-muted">
        The embedded payment form is provided by Stripe, whose accessibility is outside our
        direct control. If you encounter a barrier on any part of the site, please tell us —
        we treat accessibility reports as a priority.
      </p>

      <h2 className="mt-8 font-display text-xl font-semibold text-terminal-fg">Report a problem</h2>
      <p className="mt-3 font-sans leading-7 text-terminal-muted">
        Email{" "}
        <a href="mailto:contact@ascent-partners.com" className="underline underline-offset-4 hover:text-terminal-fg">
          contact@ascent-partners.com
        </a>{" "}
        and describe what you were trying to do and what happened. We aim to respond within
        a few business days.
      </p>

      <p className="mt-8 font-sans text-sm text-terminal-fg">
        <InlineLink href="/contact">Contact us</InlineLink>
      </p>
    </PageShell>
  );
}
