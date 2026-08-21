import type { Metadata } from "next";
import Link from "next/link";
import { COURSE_FAQ } from "@/lib/training/faq";
import { PATH } from "@/lib/training/curriculum";

export const metadata: Metadata = {
  title: "Training FAQ",
  description: "Common questions about the free Web Accessibility course.",
  alternates: { canonical: "/training/faq" },
};

export default function TrainingFaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="font-mono text-3xl font-bold text-terminal-fg">Training FAQ</h1>
      <p className="mt-2 font-mono text-sm text-terminal-muted">
        About the {PATH.title} course. For product questions, see the{" "}
        <Link href="/faq" className="underline underline-offset-4 hover:text-terminal-fg">
          main FAQ
        </Link>
        .
      </p>

      <div className="mt-8 space-y-4">
        {COURSE_FAQ.map((entry) => (
          <section key={entry.q} className="rounded border border-terminal-border bg-terminal-surface/40 p-4">
            <h2 className="font-mono text-sm font-semibold text-terminal-fg">{entry.q}</h2>
            <p className="mt-1 font-mono text-sm text-terminal-muted">{entry.a}</p>
          </section>
        ))}
      </div>

      <p className="mt-8">
        <Link
          href={`/training/paths/${PATH.id}`}
          className="inline-block rounded bg-terminal-fg px-4 py-2 font-mono text-sm font-medium text-terminal-bg hover:bg-terminal-serious"
        >
          Back to the course
        </Link>
      </p>
    </div>
  );
}
