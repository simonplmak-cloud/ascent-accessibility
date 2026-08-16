"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="font-mono text-3xl font-bold text-terminal-fg">
        Something went wrong
      </h1>
      <p className="mt-4 font-mono leading-7 text-terminal-muted">
        An unexpected error occurred. Please try again.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 rounded bg-terminal-fg px-4 py-2 font-mono text-sm text-terminal-bg hover:bg-terminal-serious"
      >
        Try again
      </button>
    </div>
  );
}
