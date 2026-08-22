"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import "./globals.css";

// Root error boundary: rendered outside the [locale] segment, so it has no
// NextIntlClientProvider and no locale context. Kept in English as the
// catastrophic, provider-less fallback.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center bg-terminal-bg px-4">
          <h1 className="font-display text-3xl font-bold text-terminal-fg">
            Something went wrong
          </h1>
          <p className="mt-4 font-sans text-terminal-muted">
            An unexpected error occurred. Please try again.
          </p>
          <button
            type="button"
            onClick={reset}
            className="mt-6 rounded bg-terminal-fg px-4 py-2 font-sans text-sm text-terminal-bg hover:bg-terminal-serious"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
