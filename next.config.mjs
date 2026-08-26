/** @type {import('next').NextConfig} */
import createNextIntlPlugin from "next-intl/plugin";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://accounts.google.com",
      "style-src 'self' 'unsafe-inline' https://accounts.google.com",
      "img-src 'self' data: blob: https://*.stripe.com https://*.stripecdn.com",
      "font-src 'self' data:",
      "connect-src 'self' https://*.stripe.com https://accounts.google.com",
      "frame-src 'self' https://js.stripe.com https://*.stripe.com https://accounts.google.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self'",
    ].join("; "),
  },
];

const nextConfig = {
  serverExternalPackages: ["playwright", "playwright-core", "axe-core", "surrealdb"],
  // Disable streaming metadata: render <title>/<meta> in <head> for all user
  // agents (not just bots), so validators/crawlers see meta in the head.
  htmlLimitedBots: /.*/,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
  async redirects() {
    return [
      { source: "/regulations", destination: "/compliance", permanent: true },
      { source: "/validation", destination: "/methodology", permanent: true },
      { source: "/resources", destination: "/guides", permanent: true },
    ];
  },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
