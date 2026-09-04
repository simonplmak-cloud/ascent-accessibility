import * as Sentry from "@sentry/nextjs";

// Server-side error tracking for the Next.js API routes + server components.
// Client-side (browser) init is intentionally omitted — the app is API/marketing
// heavy; the worker (plain Node) and these server routes carry the critical paths.
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV ?? "production",
      tracesSampleRate: 0,
    });
  }
}

export const onRequestError = Sentry.captureRequestError;
