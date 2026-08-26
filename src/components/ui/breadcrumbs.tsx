import { Link } from "@/i18n/navigation";

export interface Crumb {
  href?: string;
  label: string;
}

// Breadcrumb trail for deep pages. The current page is the last item (plain text,
// not a link); ancestors are links. Rendered as an ordered list inside a nav.
export function Breadcrumbs({ trail }: { trail: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="m-0 flex list-none flex-wrap items-center gap-x-2 gap-y-1 p-0 font-sans text-sm text-terminal-muted">
        {trail.map((crumb, index) => {
          const isLast = index === trail.length - 1;
          return (
            <li key={`${crumb.label}-${index}`} className="flex items-center gap-2">
              {index > 0 && <span aria-hidden="true">›</span>}
              {isLast || !crumb.href ? (
                <span aria-current={isLast ? "page" : undefined} className={isLast ? "text-terminal-fg" : undefined}>
                  {crumb.label}
                </span>
              ) : (
                <Link href={crumb.href} className="underline-offset-4 hover:text-terminal-fg hover:underline">
                  {crumb.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
