import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PageShell } from "@/components/ui/page-shell";
import { PageHeading } from "@/components/ui/page-heading";
import { MutedText } from "@/components/ui/text";

export default async function ResourcesPage() {
  const t = await getTranslations("resources");

  return (
    <PageShell>
      <PageHeading>{t("heading")}</PageHeading>
      <ul className="mt-6 list-disc space-y-3 pl-6 font-sans text-terminal-fg">
        <li>
          <a
            href="https://www.w3.org/TR/WCAG22/"
            className="underline underline-offset-4"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t("link1")}<span className="sr-only"> (opens in a new window)</span>
          </a>
        </li>
        <li>
          <a
            href="https://www.w3.org/WAI/WCAG22/quickref/"
            className="underline underline-offset-4"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t("link2")}<span className="sr-only"> (opens in a new window)</span>
          </a>
        </li>
        <li>
          <a
            href="https://www.section508.gov/"
            className="underline underline-offset-4"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t("link3")}<span className="sr-only"> (opens in a new window)</span>
          </a>
        </li>
        <li>
          <a
            href="https://github.com/humanity4ai/ascent-accessibility"
            className="underline underline-offset-4"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t("link4")}<span className="sr-only"> (opens in a new window)</span>
          </a>
        </li>
      </ul>
      <MutedText className="mt-6">
        {t.rich("note", {
          link1: (chunks) => (
            <Link href="/assess" className="text-brandLink underline underline-offset-4 hover:text-brand">{chunks}</Link>
          ),
          link2: (chunks) => (
            <Link href="/training" className="text-brandLink underline underline-offset-4 hover:text-brand">{chunks}</Link>
          ),
        })}
      </MutedText>
    </PageShell>
  );
}
