import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="font-mono text-3xl font-bold text-terminal-fg">
        About Ascent Partners Foundation
      </h1>

      <p className="mt-6 font-mono leading-7 text-terminal-fg">
        Ascent Partners Foundation is a Hong Kong registered charity, established in 2017, that
        works to connect sustainability with action. We foster cross-sector collaboration to
        address environmental and social challenges across the Asia-Pacific.
      </p>
      <p className="mt-4 font-mono text-sm text-terminal-muted">
        A Hong Kong Registered Charity (IRD Section 88).
      </p>

      <h2 className="mt-8 font-mono text-xl font-semibold text-terminal-fg">Areas of focus</h2>
      <ul className="mt-4 space-y-3 font-mono leading-7 text-terminal-muted">
        <li>
          <span className="text-terminal-fg">Climate action</span> — supporting climate dialogue,
          nature-based solutions, and decarbonisation pathways.
        </li>
        <li>
          <span className="text-terminal-fg">ESG integration</span> — educational resources and
          guidance on environmental, social, and governance principles for businesses and
          practitioners.
        </li>
        <li>
          <span className="text-terminal-fg">Biodiversity</span> — an IUCN partnership connecting
          conservation initiatives with philanthropic communities, and professional conservation
          education.
        </li>
      </ul>

      <h2 className="mt-8 font-mono text-xl font-semibold text-terminal-fg">Our tools</h2>
      <p className="mt-4 font-mono leading-7 text-terminal-muted">
        As part of this work we build free, practical tools — and this accessibility assessment
        is one of them. Submit a website and it checks the pages against recognised standards
        such as WCAG 2.2 AA, returning a plain-language score with findings and gentle guidance.
        It is a friendly starting point, never a verdict, and not a substitute for a certified
        audit.
      </p>

      <h2 className="mt-8 font-mono text-xl font-semibold text-terminal-fg">Our people</h2>
      <p className="mt-4 font-mono leading-7 text-terminal-muted">
        We are a small, caring team, and we welcome people who share this mission — whether you
        would like help with your own site, want to contribute your expertise, or are interested
        in joining us. Please say hello.
      </p>
      <p className="mt-4 font-mono text-sm text-terminal-fg">
        <Link href="/contact" className="underline underline-offset-4 hover:text-terminal-serious">
          Get in touch
        </Link>
      </p>
    </div>
  );
}
