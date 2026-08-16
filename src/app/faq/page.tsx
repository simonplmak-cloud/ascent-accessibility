import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Frequently asked questions",
  description: "Common questions about Ascent Accessibility — pricing, scanning, data, and limitations.",
};

const faqs = [
  {
    q: "Is the single-page scan really free?",
    a: "Yes — no account and no payment. Submit a public URL and you get a score, findings, and remediation guidance.",
  },
  {
    q: "What does the subscription unlock?",
    a: "Whole-website scans (full sitemap and link crawl), the conformance table, IBM Equal Access comparison, PDF/CSV export, API access, and saved history.",
  },
  {
    q: "How long does a scan take?",
    a: "A single page usually completes in under a minute. Whole-website scans take longer — a large site can take several minutes or more. Scans run in a queue, so during busy periods they may wait.",
  },
  {
    q: "Is a good score a guarantee of legal compliance?",
    a: "No. The tool is a self-assessment aid, not a certified audit or legal advice. Automated checks cover only part of WCAG; many criteria still need manual review.",
  },
  {
    q: "Can I scan any website?",
    a: "Please only scan sites you own or are authorised to assess, and use the service in line with our terms.",
  },
  {
    q: "Do you store my data?",
    a: "We store the URLs you scan, the findings, and any evidence so you can revisit your reports. You can delete assessments from your history at any time. See the privacy policy for detail.",
  },
  {
    q: "How do I cancel?",
    a: "From the billing portal on the site scans page — cancellation takes effect at the end of the current billing period.",
  },
];

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="font-mono text-3xl font-bold text-terminal-fg">Frequently asked questions</h1>

      <div className="mt-8 space-y-6">
        {faqs.map((faq) => (
          <section key={faq.q} className="rounded border border-terminal-border bg-terminal-surface p-4">
            <h2 className="font-mono text-base font-semibold text-terminal-fg">{faq.q}</h2>
            <p className="mt-2 font-mono text-sm leading-6 text-terminal-muted">{faq.a}</p>
          </section>
        ))}
      </div>

      <p className="mt-8 font-mono text-sm text-terminal-muted">
        Something else?{" "}
        <Link href="/contact" className="underline underline-offset-4 hover:text-terminal-fg">
          Get in touch
        </Link>
        .
      </p>
    </div>
  );
}
