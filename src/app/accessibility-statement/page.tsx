import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Accessibility statement",
  description:
    "Ascent Accessibility's commitment to accessibility — the standard we design to, and how to report a problem.",
};

export default function AccessibilityStatementPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="font-mono text-3xl font-bold text-terminal-fg">Accessibility statement</h1>
      <p className="mt-4 font-mono leading-7 text-terminal-muted">
        Ascent Partners Foundation is committed to making this site usable by everyone. We
        design it alongside screen-reader and keyboard users, not as an afterthought.
      </p>

      <h2 className="mt-8 font-mono text-xl font-semibold text-terminal-fg">Our target</h2>
      <p className="mt-3 font-mono leading-7 text-terminal-muted">
        We aim for WCAG 2.2 AAA — a stricter standard than the AA level the assessment tool
        defaults to. The interface uses a high-contrast monospace theme, a single ordered
        heading outline, standard landmarks, a skip link, visible focus, labelled form
        fields, and live announcements for dynamic changes. You can adjust text size from
        the header.
      </p>

      <h2 className="mt-8 font-mono text-xl font-semibold text-terminal-fg">Known limitations</h2>
      <p className="mt-3 font-mono leading-7 text-terminal-muted">
        The embedded payment form is provided by Stripe, whose accessibility is outside our
        direct control. If you encounter a barrier on any part of the site, please tell us —
        we treat accessibility reports as a priority.
      </p>

      <h2 className="mt-8 font-mono text-xl font-semibold text-terminal-fg">Report a problem</h2>
      <p className="mt-3 font-mono leading-7 text-terminal-muted">
        Email{" "}
        <a href="mailto:hello@ascent.partners" className="underline underline-offset-4 hover:text-terminal-fg">
          hello@ascent.partners
        </a>{" "}
        and describe what you were trying to do and what happened. We aim to respond within
        a few business days.
      </p>

      <p className="mt-8 font-mono text-sm text-terminal-fg">
        <Link href="/contact" className="underline underline-offset-4 hover:text-terminal-serious">
          Contact us
        </Link>
      </p>
    </div>
  );
}
