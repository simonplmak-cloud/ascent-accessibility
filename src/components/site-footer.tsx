import Link from "next/link";

const footerLinks = [
  { href: "/history", label: "History" },
  { href: "/api-keys", label: "API access" },
  { href: "/learn", label: "Learn" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/donate", label: "Donate" },
];

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-terminal-border">
      <div className="mx-auto max-w-6xl px-4 py-8 font-mono text-sm text-terminal-muted">
        <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="underline-offset-4 hover:text-terminal-fg hover:underline"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <p className="mt-4">
          © {new Date().getFullYear()} Ascent Partners Foundation Limited. Connecting
          sustainability and action.
        </p>
      </div>
    </footer>
  );
}
