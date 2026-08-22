import type { Metadata } from "next";
import { PageShell } from "@/components/ui/page-shell";
import { PageHeading } from "@/components/ui/page-heading";
import { MutedText } from "@/components/ui/text";
import { InlineLink } from "@/components/ui/inline-link";
import { ButtonLink } from "@/components/ui/button-link";
import { FaqJsonLd } from "@/components/faq-json-ld";

export const metadata: Metadata = {
  title: "VPAT and ACR: third-party verification explained",
  description:
    "A plain-language guide to VPATs and Accessibility Conformance Reports — what they are, why independent verification matters, and how to get one. For NGOs and government.",
  alternates: { canonical: "/guides/vpat" },
};

const faqs = [
  {
    q: "Is a VPAT the same as an ACR?",
    a: "A VPAT is the blank template; a completed, product-specific VPAT is an Accessibility Conformance Report (ACR). Buyers and procurement teams usually ask for the ACR — the filled-in, evidence-backed report.",
  },
  {
    q: "Why does third-party verification matter?",
    a: "Anyone can write a self-declared conformance claim. Independent verification — by reviewers with lived experience of disability, outside your team — is what makes the claim credible to procurement, auditors, and funders.",
  },
  {
    q: "Do I need a VPAT for a government contract?",
    a: "Often, yes. Public-sector procurement increasingly asks for an ACR (a completed VPAT) as evidence of accessibility. Our signed, dated conformance report plus independent human review supports exactly that.",
  },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="font-display text-xl font-semibold text-terminal-fg">{title}</h2>
      <div className="mt-3 font-sans leading-7 text-terminal-muted">{children}</div>
    </section>
  );
}

export default function VpatGuide() {
  return (
    <PageShell width="3xl">
      <FaqJsonLd faqs={faqs} />
      <PageHeading>VPAT and ACR: third-party verification explained</PageHeading>
      <MutedText className="mt-4">
        A plain-language guide to the documents procurement teams ask for — and why independent
        verification carries more weight than a self-declared claim.
      </MutedText>

      <Section title="The short answer">
        <p>
          A <span className="text-terminal-fg">VPAT</span> (Voluntary Product Accessibility
          Template) is a standard blank template for reporting how accessible a product is. A
          completed, product-specific VPAT is an{" "}
          <span className="text-terminal-fg">ACR</span> (Accessibility Conformance Report). When a
          buyer asks for &ldquo;a VPAT&rdquo;, they usually mean the finished ACR — the
          evidence-backed report, not the empty form.
        </p>
      </Section>

      <Section title="Self-declared vs independently verified">
        <div className="mt-4 overflow-x-auto rounded border border-terminal-border">
          <table className="w-full border-collapse font-sans text-sm">
            <thead>
              <tr className="border-b border-terminal-border text-left text-terminal-muted">
                <th scope="col" className="px-3 py-2 font-medium"></th>
                <th scope="col" className="px-3 py-2 font-medium">Self-declared</th>
                <th scope="col" className="px-3 py-2 font-medium">Independently verified</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-terminal-border">
                <th scope="row" className="px-3 py-2 text-left text-terminal-fg">Who writes it</th>
                <td className="px-3 py-2">You, about your own product</td>
                <td className="px-3 py-2">An outside, independent reviewer</td>
              </tr>
              <tr className="border-b border-terminal-border">
                <th scope="row" className="px-3 py-2 text-left text-terminal-fg">Credibility</th>
                <td className="px-3 py-2">An assertion</td>
                <td className="px-3 py-2">Evidence with provenance</td>
              </tr>
              <tr>
                <th scope="row" className="px-3 py-2 text-left text-terminal-fg">Stands up to</th>
                <td className="px-3 py-2">Light review</td>
                <td className="px-3 py-2">Procurement, audit, due diligence</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="What a strong ACR includes">
        <ul className="list-disc space-y-2 pl-6">
          <li>The standard and level tested (for example, WCAG 2.2 AA).</li>
          <li>Per-criterion results with evidence — pass, fail, or needs review.</li>
          <li>How each was tested — machine, AI, or human review.</li>
          <li>A signature and date, so it is an auditable record.</li>
          <li>The reviewer&rsquo;s independence and method.</li>
        </ul>
        <p className="mt-3">
          <InlineLink href="/guides/conformance-report">
            Read about conformance reports
          </InlineLink>
          .
        </p>
      </Section>

      <Section title="Common questions">
        <div className="space-y-4">
          {faqs.map((faq) => (
            <div key={faq.q}>
              <h3 className="font-display text-base font-semibold text-terminal-fg">{faq.q}</h3>
              <p className="mt-1">{faq.a}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Get independent verification">
        <div className="flex flex-wrap gap-3">
          <ButtonLink href="/human-review">Request independent review</ButtonLink>
          <ButtonLink href="/assess" variant="outline">
            Scan your site free first
          </ButtonLink>
        </div>
      </Section>
    </PageShell>
  );
}
