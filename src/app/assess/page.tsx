import { listStandards } from "@/lib/standards/catalog";
import { AssessmentForm } from "@/components/assessment/assessment-form";

export default function AssessPage() {
  const standards = listStandards().map((s) => ({ id: s.id, name: s.name }));
  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="text-3xl font-bold">Assess your website</h1>
      <p className="mt-2 text-neutral-600">
        Enter a public URL and choose a standard. We&apos;ll crawl your site and return a
        score with findings and recommendations.
      </p>
      <div className="mt-8">
        <AssessmentForm standards={standards} />
      </div>
    </div>
  );
}
