import Link from "next/link";
import type { Metadata } from "next";
import { PATH } from "@/lib/training/curriculum";

export const metadata: Metadata = {
  title: "Training",
  description:
    "Free, structured WCAG training. Learn web accessibility, pass the assessments, and earn a PDF certificate.",
};

export default function TrainingDashboardPage() {
  const activityCount = PATH.modules.reduce((n, m) => n + m.activities.length, 0);
  const moduleCount = PATH.modules.length;

  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="font-mono text-3xl font-bold text-terminal-fg">Training</h1>
      <p className="mt-2 font-mono leading-7 text-terminal-muted">
        A free, self-paced path to understanding WCAG 2.2 — lessons, assessments, and a
        downloadable certificate. No paywall.
      </p>

      <section aria-labelledby="path-heading" className="mt-8">
        <h2 id="path-heading" className="font-mono text-lg font-semibold text-terminal-fg">
          Learning path
        </h2>
        <div className="mt-4 rounded border border-terminal-border bg-terminal-surface p-6">
          <p className="font-mono text-lg font-semibold text-terminal-fg">{PATH.title}</p>
          <p className="mt-1 font-mono text-sm text-terminal-muted">
            {moduleCount} modules · {activityCount} activities · 100% free — including the
            certificate
          </p>
          <div className="mt-4">
            <Link
              href={`/training/paths/${PATH.id}`}
              className="inline-block rounded bg-terminal-fg px-4 py-2 font-mono text-sm font-medium text-terminal-bg hover:bg-terminal-serious"
            >
              Start learning
            </Link>
          </div>
        </div>
      </section>

      <p className="mt-6 font-mono text-sm text-terminal-muted">
        Sign in to save your progress and earn the certificate.
      </p>
    </div>
  );
}
