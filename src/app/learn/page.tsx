import Link from "next/link";

const topics = [
  {
    href: "/learn/wcag",
    title: "How WCAG works",
    description: "Principles, guidelines, success criteria, and the A/AA/AAA conformance levels.",
  },
  {
    href: "/learn/severity",
    title: "Understanding severity",
    description: "What critical/serious/moderate/minor mean — and why severity is not the same as the conformance level.",
  },
  {
    href: "/learn/remediation",
    title: "Remediation examples",
    description: "Before/after fixes for common accessibility failures.",
  },
];

export default function LearnPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="font-mono text-3xl font-bold text-terminal-fg">Learn</h1>
      <p className="mt-4 font-mono text-terminal-muted">
        Plain-language guidance to understand WCAG 2.2, interpret your assessment results,
        and fix the issues you find.
      </p>
      <ul className="mt-8 space-y-4">
        {topics.map((topic) => (
          <li key={topic.href}>
            <Link
              href={topic.href}
              className="block rounded border border-terminal-border bg-terminal-surface p-4 hover:border-terminal-serious"
            >
              <span className="font-mono text-lg font-semibold text-terminal-fg">
                {topic.title}
              </span>
              <span className="mt-1 block font-mono text-sm text-terminal-muted">
                {topic.description}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
