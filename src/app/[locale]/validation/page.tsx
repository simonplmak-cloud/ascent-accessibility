import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PageShell } from "@/components/ui/page-shell";
import { PageHeading } from "@/components/ui/page-heading";
import { MutedText } from "@/components/ui/text";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "validationPage" });
  return { title: t("title"), description: t("description") };
}

const comparison: Array<[string, string, string, string, string, string]> = [
  ["axe-core (open-source)", "✓", "—", "—", "~30–50%", "—"],
  ["Lighthouse", "✓ (uses axe-core)", "—", "—", "~30–50%", "—"],
  ["Enterprise audit services", "✓", "varies", "expert-led (not lived-experience)", "full (manual)", "report, not in-app"],
  ["Ascent Accessibility", "✓", "✓", "coming soon (lived-experience)", "✓ 100%", "✓ signed, in-app + PDF"],
];

export default async function ValidationPage() {
  const t = await getTranslations("validationPage");

  return (
    <PageShell width="4xl">
      <PageHeading>{t("heading")}</PageHeading>
      <MutedText className="mt-4">{t("intro")}</MutedText>

      <h2 className="mt-8 font-display text-xl font-semibold text-terminal-fg">{t("coverageTitle")}</h2>
      <p className="mt-3 font-sans leading-7 text-terminal-muted">{t("coverageBody")}</p>

      <h2 className="mt-8 font-display text-xl font-semibold text-terminal-fg">{t("comparisonTitle")}</h2>
      <div className="mt-3 overflow-x-auto rounded border border-terminal-border">
        <table className="w-full border-collapse font-sans text-xs">
          <thead>
            <tr className="border-b border-terminal-border text-left text-terminal-muted">
              <th scope="col" className="px-3 py-2 font-medium">{t("thTool")}</th>
              <th scope="col" className="px-3 py-2 font-medium">{t("thAutomated")}</th>
              <th scope="col" className="px-3 py-2 font-medium">{t("thAi")}</th>
              <th scope="col" className="px-3 py-2 font-medium">{t("thHuman")}</th>
              <th scope="col" className="px-3 py-2 font-medium">{t("thCoverage")}</th>
              <th scope="col" className="px-3 py-2 font-medium">{t("thReport")}</th>
            </tr>
          </thead>
          <tbody>
            {comparison.map((row) => (
              <tr key={row[0]} className="border-b border-terminal-border last:border-b-0">
                {row.map((cell, i) => (
                  <td
                    key={i}
                    className={`px-3 py-2 ${i === 0 ? "text-terminal-fg" : "text-terminal-muted"}`}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 font-sans text-xs text-terminal-muted">{t("note")}</p>

      <p className="mt-8 font-sans text-sm text-terminal-fg">
        <Link href="/methodology" className="text-brandLink underline underline-offset-4 hover:text-brand">{t("methodology")}</Link>{" · "}
        <Link href="/standards" className="text-brandLink underline underline-offset-4 hover:text-brand">{t("standards")}</Link>{" · "}
        <Link href="/esg" className="text-brandLink underline underline-offset-4 hover:text-brand">{t("esg")}</Link>
      </p>
    </PageShell>
  );
}
