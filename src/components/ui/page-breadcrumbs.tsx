import { getTranslations } from "next-intl/server";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { tierOf } from "@/lib/site/navigation";

// Breadcrumb trail for top-level content pages, so every page reports the
// user's location within the site (WCAG 2.4.8). Renders "Home › <Tier> › <Page>".
export async function PageBreadcrumbs({ path, title }: { path: string; title: string }) {
  const t = await getTranslations("nav");
  const tier = tierOf(path);
  return (
    <Breadcrumbs
      trail={[
        { href: "/", label: t("homeShort") },
        ...(tier ? [{ label: t(tier) }] : []),
        { label: title },
      ]}
    />
  );
}
