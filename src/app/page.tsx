import Link from "next/link";

export default function Home() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <section className="max-w-2xl">
        <h1 className="text-4xl font-bold tracking-tight">
          Measure your website&apos;s accessibility
        </h1>
        <p className="mt-4 text-lg text-neutral-600">
          Run a free accessibility assessment against WCAG 2.2 AA. Get a score, concrete
          findings, and remediation guidance — no login required.
        </p>
        <div className="mt-8">
          <Link
            href="/assess"
            className="rounded-md bg-neutral-900 px-6 py-3 text-base font-medium text-white hover:bg-neutral-700"
          >
            Assess your site
          </Link>
        </div>
      </section>

      <section className="mt-20 grid gap-8 md:grid-cols-3" aria-label="What you get">
        <div>
          <h2 className="text-lg font-semibold">Assessment findings</h2>
          <p className="mt-2 text-neutral-600">
            Detailed violations with the rule, impact level, and affected page.
          </p>
        </div>
        <div>
          <h2 className="text-lg font-semibold">Recommendations</h2>
          <p className="mt-2 text-neutral-600">
            Actionable remediation guidance for every finding.
          </p>
        </div>
        <div>
          <h2 className="text-lg font-semibold">A clear score</h2>
          <p className="mt-2 text-neutral-600">
            An overall 0–100 score with a pass, partial, or fail result.
          </p>
        </div>
      </section>
    </div>
  );
}
