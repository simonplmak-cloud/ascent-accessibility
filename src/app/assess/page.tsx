import Link from "next/link";
import { listStandards } from "@/lib/standards/catalog";
import { AssessmentForm } from "@/components/assessment/assessment-form";

export default function AssessPage() {
  const standards = listStandards().map((s) => ({ id: s.id, name: s.name }));
  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="font-mono text-3xl font-bold text-terminal-fg">Assess your website</h1>
      <p className="mt-2 font-mono leading-7 text-terminal-muted">
        Run a free single-page assessment. Enter a public URL and choose a standard. We&apos;ll
        scan that page and return a score with findings and recommendations — no account required.
      </p>
      <p className="mt-2 font-mono text-sm text-terminal-fg">
        Want your whole site?{" "}
        <Link href="/site" className="underline underline-offset-4 hover:text-terminal-serious">
          Upgrade to whole-website scans
        </Link>
        .
      </p>
      <div className="mt-8">
        <AssessmentForm standards={standards} fixedScope="page" />
      </div>
    </div>
  );
}
