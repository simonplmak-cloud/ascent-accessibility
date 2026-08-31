import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PageShell } from "@/components/ui/page-shell";
import { PageHeading } from "@/components/ui/page-heading";
import { PageBreadcrumbs } from "@/components/ui/page-breadcrumbs";
import { RelatedLinks } from "@/components/ui/related-links";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "roadmap" });
  return { title: t("title"), description: t("description") };
}

export default async function RoadmapPage() {
  const t = await getTranslations("roadmap");
  const shipped = [1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => t(`s${n}`));
  const planned = [1, 2, 3, 4, 5, 6].map((n) => t(`p${n}`));

  return (
    <PageShell width="4xl">
      <PageBreadcrumbs path="/roadmap" title={t("heading")} />
      <PageHeading>{t("heading")}</PageHeading>

      <h2 className="mt-8 font-display text-xl font-semibold text-terminal-fg">{t("shipped")}</h2>
      <ul className="mt-3 list-disc space-y-1 pl-6 font-sans text-sm text-terminal-muted">
        {shipped.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      <h2 className="mt-8 font-display text-xl font-semibold text-terminal-fg">{t("planned")}</h2>
      <ul className="mt-3 list-disc space-y-1 pl-6 font-sans text-sm text-terminal-muted">
        {planned.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      <p className="mt-8 font-sans text-sm text-terminal-fg">
        <Link href="/methodology" className="text-brandLink underline underline-offset-4 hover:text-brand">{t("methodology")}</Link>{" · "}
        <Link href="/methodology" className="text-brandLink underline underline-offset-4 hover:text-brand">{t("validation")}</Link>{" · "}
        <Link href="/contact" className="text-brandLink underline underline-offset-4 hover:text-brand">{t("contact")}</Link>
      </p>
          <RelatedLinks path="/roadmap" />
    </PageShell>
  );
}
