// Canonical public origin for the app. `NEXT_PUBLIC_SITE_URL` is inlined at
// build time (both client and server bundles), so it must be set in Vercel for
// production; the fallback keeps local dev and misconfigured builds on the real
// domain. No Node-only imports — safe to import from any module.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://accessibility.ascent.partners";

export function getSiteUrl(): string {
  return SITE_URL;
}
