import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/ui/page-shell";
import { PageHeading } from "@/components/ui/page-heading";
import { MutedText } from "@/components/ui/text";

export const metadata: Metadata = {
  title: "Learn",
  description:
    "Guides on web accessibility, WCAG success criteria, and how to use screen readers.",
  alternates: { canonical: "/learn" },
};

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
  {
    href: "/learn/screen-readers",
    title: "Reading with a screen reader",
    description: "How this site works with NVDA, JAWS, VoiceOver, Narrator, and TalkBack.",
  },
];

export default function LearnPage() {
  return (
    <PageShell>
      <PageHeading>Learn</PageHeading>
      <MutedText className="mt-4">
        Plain-language guidance to understand WCAG 2.2, interpret your assessment results,
        and fix the issues you find.
      </MutedText>
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
    </PageShell>
  );
}
