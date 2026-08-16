import Link from "next/link";

const footerLinks = [
  { href: "/about", label: "About" },
  { href: "/pricing", label: "Pricing" },
  { href: "/learn", label: "Learn" },
  { href: "/standards", label: "WCAG criteria" },
  { href: "/methodology", label: "Methodology" },
  { href: "/faq", label: "FAQ" },
  { href: "/resources", label: "Resources" },
  { href: "/contact", label: "Contact" },
  { href: "/donate", label: "Donate" },
];

const legalLinks = [
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
  { href: "/sla", label: "Service commitment" },
  { href: "/refund", label: "Refunds" },
  { href: "/accessibility-statement", label: "Accessibility" },
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
        <nav aria-label="Legal" className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
          {legalLinks.map((link) => (
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
