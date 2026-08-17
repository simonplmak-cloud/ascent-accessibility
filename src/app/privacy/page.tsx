import type { Metadata } from "next";
import { PageShell } from "@/components/ui/page-shell";
import { PageHeading } from "@/components/ui/page-heading";
import { LegalNote } from "@/components/legal/legal-note";

export const metadata: Metadata = {
  title: "Privacy policy",
  description:
    "How Ascent Accessibility handles personal data — what we collect, why, and how long we keep it.",
};

export default function PrivacyPage() {
  return (
    <PageShell>
      <PageHeading>Privacy policy</PageHeading>
      <p className="mt-3 font-mono text-sm text-terminal-muted">Last updated: August 2026</p>

      <h2 className="mt-8 font-mono text-xl font-semibold text-terminal-fg">1. What we collect</h2>
      <ul className="mt-3 list-disc space-y-2 pl-6 font-mono leading-7 text-terminal-muted">
        <li><strong className="text-terminal-fg">Account data</strong> — email address and name when you create an account.</li>
        <li><strong className="text-terminal-fg">Assessment data</strong> — the URLs you scan, the findings, and any screenshot evidence we capture.</li>
        <li><strong className="text-terminal-fg">Anonymous visitors</strong> — a random identifier stored in a cookie so you can see your own history without an account.</li>
        <li><strong className="text-terminal-fg">Payment</strong> — handled entirely by Stripe. We do not receive or store card details.</li>
      </ul>

      <h2 className="mt-8 font-mono text-xl font-semibold text-terminal-fg">2. Why we process it</h2>
      <p className="mt-3 font-mono leading-7 text-terminal-muted">
        We use this data to run the assessment, store your history and reports, provide API
        access to subscribers, and operate and improve the Service. We do not sell personal
        data or use it for advertising.
      </p>

      <h2 className="mt-8 font-mono text-xl font-semibold text-terminal-fg">3. Retention</h2>
      <p className="mt-3 font-mono leading-7 text-terminal-muted">
        Assessments and their evidence are retained so you can revisit and export your
        reports. You can delete individual assessments from your history at any time. If you
        would like your account and all associated data removed, contact us.
      </p>

      <h2 className="mt-8 font-mono text-xl font-semibold text-terminal-fg">4. Your rights</h2>
      <p className="mt-3 font-mono leading-7 text-terminal-muted">
        You may request access to, correction of, or deletion of your personal data by
        contacting us. We respond within the timeframe required by the Personal Data
        (Privacy) Ordinance of Hong Kong (Cap. 486).
      </p>

      <h2 className="mt-8 font-mono text-xl font-semibold text-terminal-fg">5. Contact</h2>
      <p className="mt-3 font-mono leading-7 text-terminal-muted">
        Privacy enquiries:{" "}
        <a href="mailto:contact@ascent-partners.com" className="underline underline-offset-4 hover:text-terminal-fg">
          contact@ascent-partners.com
        </a>
        .
      </p>

      <LegalNote label="privacy policy" />
    </PageShell>
  );
}
