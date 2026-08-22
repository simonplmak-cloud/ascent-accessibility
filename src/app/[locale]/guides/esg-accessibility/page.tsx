import type { Metadata } from "next";
import { PageShell } from "@/components/ui/page-shell";
import { PageHeading } from "@/components/ui/page-heading";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { MutedText } from "@/components/ui/text";
import { InlineLink } from "@/components/ui/inline-link";
import { ButtonLink } from "@/components/ui/button-link";
import { FaqJsonLd } from "@/components/faq-json-ld";

export const metadata: Metadata = {
  title: "Digital accessibility and ESG reporting",
  description:
    "How digital accessibility maps to the 'S' in ESG — GRI, ESRS, and SASB — and how to evidence it for funders, investors, and sustainability reports. Plain-language guide.",
  alternates: { canonical: "/guides/esg-accessibility" },
};

const faqs = [
  {
    q: "Which part of ESG does accessibility belong to?",
    a: "The 'S' — Social. Digital accessibility is a measurable form of social inclusion: whether your digital services exclude people with disabilities. It fits naturally alongside labour practices, human rights, and community impact.",
  },
  {
    q: "Which frameworks cover it?",
    a: "GRI (social/disclosures on inclusion), ESRS (the European Sustainability Reporting Standards, especially S1 own workforce and S2/S3 affected communities), and SASB (industry-specific social metrics). A conformance report gives you concrete, auditable data for these.",
  },
  {
    q: "What evidence do I actually report?",
    a: "A signed, dated accessibility conformance report — your score, per-criterion results, and how each was tested — is a concrete, auditable data point for the 'S' disclosure, far stronger than a statement of intention.",
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

export default function EsgAccessibilityGuide() {
  return (
    <PageShell width="3xl">
      <FaqJsonLd faqs={faqs} />
      <Breadcrumbs trail={[{ href: "/guides", label: "Guides" }, { label: "Digital accessibility and ESG" }]} />
      <PageHeading>Digital accessibility and ESG reporting</PageHeading>
      <MutedText className="mt-4">
        A plain-language guide to treating accessibility as measurable ESG data — not just a
        compliance checkbox.
      </MutedText>

      <Section title="Accessibility is the 'S' in ESG">
        <p>
          ESG breaks into Environmental, Social, and Governance. Digital accessibility sits
          squarely in the <span className="text-terminal-fg">Social</span> pillar: it is a
          measurable form of inclusion — whether your website and digital services exclude people
          with disabilities. For NGOs, funders, and sustainability teams, that makes accessibility
          a reportable social outcome, not just a technical task.
        </p>
      </Section>

      <Section title="How it maps to the frameworks">
        <div className="mt-4 overflow-x-auto rounded border border-terminal-border">
          <table className="w-full border-collapse font-sans text-sm">
            <thead>
              <tr className="border-b border-terminal-border text-left text-terminal-muted">
                <th scope="col" className="px-3 py-2 font-medium">Framework</th>
                <th scope="col" className="px-3 py-2 font-medium">Where accessibility fits</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-terminal-border">
                <td className="px-3 py-2 text-terminal-fg">GRI</td>
                <td className="px-3 py-2">Social disclosures on inclusion and non-discrimination.</td>
              </tr>
              <tr className="border-b border-terminal-border">
                <td className="px-3 py-2 text-terminal-fg">ESRS</td>
                <td className="px-3 py-2">S1 (own workforce) and affected-communities disclosures on inclusion.</td>
              </tr>
              <tr>
                <td className="px-3 py-2 text-terminal-fg">SASB</td>
                <td className="px-3 py-2">Industry-specific social metrics, including customer/accessibility items.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3">
          <InlineLink href="/esg">See how our report maps to GRI, ESRS, and SASB</InlineLink>.
        </p>
      </Section>

      <Section title="From intention to evidence">
        <p>
          A statement that &ldquo;we care about inclusion&rdquo; is hard to audit. A signed, dated
          accessibility conformance report — your score, per-criterion results, and how each was
          tested — is a concrete data point you can put in an ESG or sustainability report. It
          turns a value into a verifiable metric.{" "}
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

      <Section title="Get your ESG-ready evidence">
        <div className="flex flex-wrap gap-3">
          <ButtonLink href="/assess">Scan your site free</ButtonLink>
          <ButtonLink href="/esg" variant="outline">
            ESG mapping
          </ButtonLink>
        </div>
      </Section>
    </PageShell>
  );
}
