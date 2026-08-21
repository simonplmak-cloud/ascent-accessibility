import { notFound } from "next/navigation";
import { trainingRepository } from "@/db/repository";
import { PATH } from "@/lib/training/curriculum";

export default async function CertificatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const credential = await trainingRepository.getCredential(id);
  if (!credential) notFound();

  const completed = new Date(credential.completedAt);
  const date = Number.isNaN(completed.getTime())
    ? credential.completedAt
    : completed.toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <div className="rounded border border-terminal-border bg-terminal-surface p-8 text-center">
        <p className="font-mono text-sm font-semibold uppercase tracking-widest text-terminal-muted">
          Ascent Accessibility
        </p>
        <h1 className="mt-6 font-mono text-3xl font-bold text-terminal-fg">
          Certificate of Completion
        </h1>
        <p className="mt-6 font-mono text-sm text-terminal-muted">This certifies that</p>
        <p className="mt-2 font-mono text-2xl font-semibold text-terminal-fg">
          {credential.name || "Learner"}
        </p>
        <p className="mt-4 font-mono text-sm text-terminal-muted">has completed</p>
        <p className="mt-2 font-mono text-lg font-semibold text-terminal-fg">
          {credential.path}{" "}
          <span className="text-terminal-muted">(v{credential.pathVersion})</span>
        </p>
        <p className="mt-6 font-mono text-sm text-terminal-fg">
          Completed {date}
          {credential.score != null ? ` · Score ${credential.score}%` : ""}
        </p>

        <div className="mt-8">
          <a
            href={`/training/certificate/${credential.id}/download.pdf`}
            className="inline-block rounded bg-terminal-fg px-4 py-2 font-mono text-sm font-medium text-terminal-bg hover:bg-terminal-serious"
          >
            Download PDF
          </a>
        </div>
      </div>

      <p className="mt-6 text-center font-mono text-xs text-terminal-muted">
        Credential ID {credential.id} · Verify at {PATH.title}
      </p>
    </div>
  );
}
