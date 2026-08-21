import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-24 text-center">
      <p className="font-sans text-6xl font-bold text-terminal-serious">404</p>
      <h1 className="mt-4 font-display text-2xl font-bold text-terminal-fg">Page not found</h1>
      <p className="mt-2 font-sans text-sm text-terminal-muted">
        The page you&apos;re looking for doesn&apos;t exist or may have been moved.
      </p>
      <p className="mt-6">
        <Link
          href="/"
          className="inline-block rounded bg-terminal-fg px-6 py-2 font-sans text-sm font-medium text-terminal-bg hover:bg-terminal-serious"
        >
          Back home
        </Link>
      </p>
    </div>
  );
}
