// Renders FAQPage JSON-LD structured data so search engines can surface the
// questions and answers as rich results. Content is also rendered visibly —
// this only adds the machine-readable schema.
export function FaqJsonLd({ faqs }: { faqs: Array<{ q: string; a: string }> }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
