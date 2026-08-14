import Link from "next/link";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/learn", label: "Learn" },
  { href: "/contact", label: "Contact" },
  { href: "/donate", label: "Donate" },
];

export function SiteHeader() {
  return (
    <header className="border-b border-terminal-border">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link href="/" className="font-mono text-lg font-semibold text-terminal-fg">
          Ascent Partners
        </Link>
        <nav aria-label="Primary" className="flex items-center gap-6">
          <ul className="m-0 flex list-none gap-6 p-0">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="font-mono text-sm text-terminal-fg underline-offset-4 hover:underline"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/assess"
            className="rounded bg-terminal-fg px-4 py-2 font-mono text-sm font-medium text-terminal-bg hover:bg-terminal-serious"
          >
            Start assessment
          </Link>
        </nav>
      </div>
    </header>
  );
}
