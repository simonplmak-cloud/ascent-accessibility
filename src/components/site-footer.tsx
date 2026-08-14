import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-neutral-200">
      <div className="mx-auto max-w-5xl px-4 py-8 text-sm text-neutral-600">
        <p>
          © {new Date().getFullYear()} Ascent Partners. Committed to an accessible web for
          everyone.
        </p>
        <p className="mt-2">
          <Link href="/contact" className="underline underline-offset-4 hover:text-neutral-900">
            Contact us
          </Link>{" "}
          to discuss your accessibility strategy.
        </p>
      </div>
    </footer>
  );
}
