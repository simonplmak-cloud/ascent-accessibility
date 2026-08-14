import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-terminal-border">
      <div className="mx-auto max-w-5xl px-4 py-8 font-mono text-sm text-terminal-muted">
        <p>
          © {new Date().getFullYear()} Ascent Partners. Committed to an accessible web for
          everyone.
        </p>
        <p className="mt-2">
          <Link href="/contact" className="underline underline-offset-4 hover:text-terminal-fg">
            Contact us
          </Link>{" "}
          or{" "}
          <Link href="/donate" className="underline underline-offset-4 hover:text-terminal-fg">
            donate
          </Link>{" "}
          to support the tool.
        </p>
      </div>
    </footer>
  );
}
