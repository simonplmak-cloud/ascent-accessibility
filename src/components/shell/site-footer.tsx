import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ACCOUNT_MENU, LEGAL_LINKS, SITE_SECTIONS } from "@/lib/site/navigation";

export function SiteFooter() {
  const t = useTranslations("nav");
  const tf = useTranslations("footer");

  return (
    <footer className="mt-16 border-t border-terminal-border">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-6">
          {SITE_SECTIONS.map((section) => (
            <nav key={section.label} aria-label={t(section.label)}>
              <h2 className="font-sans text-sm font-semibold text-terminal-fg">
                {t(section.label)}
              </h2>
              <ul className="mt-3 m-0 list-none space-y-6 p-0">
                {section.children.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="inline-flex min-h-6 items-center font-sans text-sm text-terminal-muted underline-offset-4 hover:text-terminal-fg hover:underline"
                    >
                      {t(link.label)}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <nav aria-label={t("account")}>
            <h2 className="font-sans text-sm font-semibold text-terminal-fg">{t("account")}</h2>
            <ul className="mt-3 m-0 list-none space-y-6 p-0">
              {ACCOUNT_MENU.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-flex min-h-6 items-center font-sans text-sm text-terminal-muted underline-offset-4 hover:text-terminal-fg hover:underline"
                  >
                    {t(link.label)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-terminal-border/40 pt-6">
          <p className="font-sans text-xs text-terminal-muted">
            {tf("copyright", { year: new Date().getFullYear() })}
          </p>
          <nav aria-label="Legal" className="flex flex-wrap gap-x-5 gap-y-2">
            {LEGAL_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="inline-flex min-h-6 items-center font-sans text-xs text-terminal-muted underline-offset-4 hover:text-terminal-fg hover:underline"
              >
                {t(link.label)}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
