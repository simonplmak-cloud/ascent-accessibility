"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { RELATED_LINKS } from "@/lib/site/navigation";

// Visible "Related" block of descriptive cross-links. Reciprocal by construction
// (see RELATED_LINKS in navigation.ts) so no page is a one-way sink.
export function RelatedLinks({ path }: { path: string }) {
  const t = useTranslations("common");
  const tnav = useTranslations("nav");
  const related = RELATED_LINKS[path];
  if (!related || related.length === 0) return null;

  return (
    <nav aria-label={t("relatedPages")} className="mt-10 rounded border border-terminal-border bg-terminal-surface/40 p-4">
      <h2 className="m-0 font-sans text-xs font-semibold uppercase tracking-wider text-terminal-muted">
        {t("relatedPages")}
      </h2>
      <ul className="m-0 mt-2 flex list-none flex-wrap gap-x-5 gap-y-2 p-0">
        {related.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="inline-flex min-h-6 items-center font-sans text-sm text-terminal-fg underline underline-offset-4 hover:text-brand"
            >
              {tnav(link.label)}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
