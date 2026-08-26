import type { ReactNode } from "react";

// Shared OAuth provider button: neutral dark, full-width, brand logo left +
// localized "Continue with {provider}" label. Renders an <a> for redirect-based
// providers (GitHub/Microsoft) or a <button> for the Google GIS flow.
export function ProviderButton({
  logo,
  label,
  href,
  onClick,
}: {
  logo: ReactNode;
  label: string;
  href?: string;
  onClick?: () => void;
}) {
  const classes =
    "flex w-full items-center justify-center gap-3 rounded border border-terminal-border bg-terminal-surface px-4 py-2.5 font-sans text-sm text-terminal-fg transition-colors hover:bg-terminal-surface/60 focus:outline-none focus:ring-2 focus:ring-terminal-fg";

  const inner = (
    <>
      <span className="flex h-5 w-5 shrink-0 items-center justify-center" aria-hidden="true">
        {logo}
      </span>
      <span>{label}</span>
    </>
  );

  if (href) {
    return (
      <a href={href} className={classes}>
        {inner}
      </a>
    );
  }
  return (
    <button type="button" onClick={onClick} className={classes}>
      {inner}
    </button>
  );
}
