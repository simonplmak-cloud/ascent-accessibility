import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="font-mono text-3xl font-bold text-terminal-fg">About Ascent Partners</h1>

      <p className="mt-6 font-mono leading-7 text-terminal-fg">
        At Ascent Partners, we believe the web should feel welcoming to everyone. A digital
        product is only truly finished when every person who visits it can use it with ease —
        however they browse, see, hear, or move.
      </p>

      <p className="mt-4 font-mono leading-7 text-terminal-muted">
        Our free assessment tool is one small way we try to help. Give it a site, and it gently
        checks the pages against recognised standards such as WCAG 2.2 AA, then returns a
        plain-language score with findings and practical guidance on what to improve. It is a
        friendly starting point, never a verdict — and certainly not a substitute for a certified
        audit.
      </p>

      <h2 className="mt-8 font-mono text-xl font-semibold text-terminal-fg">Our people</h2>
      <p className="mt-4 font-mono leading-7 text-terminal-muted">
        We are a small, caring team, and we are always glad to hear from people who share this
        mission. If making the web more accessible matters to you — whether you would like help
        with your own site, want to contribute your expertise, or are interested in joining us —
        please say hello. We would be delighted to talk.
      </p>
      <p className="mt-4 font-mono text-sm text-terminal-fg">
        <Link href="/contact" className="underline underline-offset-4 hover:text-terminal-serious">
          Get in touch
        </Link>
      </p>
    </div>
  );
}
