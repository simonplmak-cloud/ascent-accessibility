import type { Metadata } from "next";
import { listStandards } from "@/lib/standards/catalog";
import { AssessmentForm } from "@/components/assessment/assessment-form";

export const metadata: Metadata = {
  title: "Scan your website",
  description:
    "Scan your website against WCAG 2.0, 2.1, 2.2, or Section 508. Submit a URL and get a conformance result with findings and remediation guidance.",
};

export default function AssessPage() {
  const standards = listStandards().map((s) => ({ id: s.id, name: s.name }));
  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="font-display text-3xl font-bold text-terminal-fg">Scan your website</h1>
      <p className="mt-2 font-sans leading-7 text-terminal-muted">
        Scan a single page or your whole website. Enter a public URL, choose a standard, and
        pick a scope — we&apos;ll crawl and scan, then return a score with findings and
        remediation guidance.
      </p>
      <div className="mt-8">
        <AssessmentForm standards={standards} />
      </div>
    </div>
  );
}
