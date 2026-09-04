import * as Sentry from "@sentry/node";

// Error tracking for the worker (plain Node). Next.js serverless surfaces use
// @sentry/nextjs via instrumentation.ts instead. pino remains the structured
// logger; Sentry is additive (captures exceptions with context for diagnosis).
export function initSentry(): void {
  if (!process.env.SENTRY_DSN) return;
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV ?? "production",
    release: process.env.SENTRY_RELEASE,
    tracesSampleRate: 0,
    // Keep the redaction posture from pino: never send auth/secret material.
    beforeSend(event) {
      const req = event.request as { headers?: Record<string, unknown> } | undefined;
      if (req?.headers) {
        delete req.headers.authorization;
        delete req.headers.cookie;
      }
      return event;
    },
  });
}

export function captureError(error: unknown, context?: Record<string, unknown>): void {
  Sentry.withScope((scope) => {
    if (context) scope.setContext("details", context);
    Sentry.captureException(error);
  });
}
