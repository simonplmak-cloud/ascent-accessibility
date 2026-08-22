import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { trainingRepository } from "@/db/repository";
import { curriculumFor } from "@/lib/training/curriculum";

export default async function CertificatePage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id, locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("certificate");
  const { path } = curriculumFor(locale);
  const credential = await trainingRepository.getCredential(id);
  if (!credential) notFound();

  const completed = new Date(credential.completedAt);
  const date = Number.isNaN(completed.getTime())
    ? credential.completedAt
    : completed.toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <div className="rounded border border-terminal-border bg-terminal-surface p-8 text-center">
        <p className="font-sans text-sm font-semibold uppercase tracking-widest text-terminal-muted">
          Ascent Accessibility
        </p>
        <h1 className="mt-6 font-display text-3xl font-bold text-terminal-fg">
          {t("title")}
        </h1>
        <p className="mt-6 font-sans text-sm text-terminal-muted">{t("certifies")}</p>
        <p className="mt-2 font-display text-2xl font-semibold text-terminal-fg">
          {credential.name || t("learner")}
        </p>
        <p className="mt-4 font-sans text-sm text-terminal-muted">{t("hasCompleted")}</p>
        <p className="mt-2 font-display text-lg font-semibold text-terminal-fg">
          {path.title}{" "}
          <span className="text-terminal-muted">(v{credential.pathVersion})</span>
        </p>
        <p className="mt-6 font-sans text-sm text-terminal-fg">
          {t("completedOn", { date })}
          {credential.score != null ? t("scoreSuffix", { score: credential.score }) : ""}
        </p>

        <div className="mt-8">
          <a
            href={`/training/certificate/${credential.id}/download.pdf`}
            className="inline-block rounded bg-terminal-fg px-4 py-2 font-sans text-sm font-medium text-terminal-bg hover:bg-terminal-serious"
          >
            {t("downloadPdf")}
          </a>
        </div>
      </div>

      <p className="mt-6 text-center font-sans text-xs text-terminal-muted">
        {t("credentialId", { id: credential.id, path: path.title })}
      </p>
    </div>
  );
}
