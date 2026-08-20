import { expect, test } from "@playwright/test";

// Live-domain smoke: verifies the production domain is baked into every
// canonical URL, redirect, and asset after the domain rename. Run with
// E2E_LIVE=1 and PLAYWRIGHT_BASE_URL=https://accessibility.ascent.partners.
const base = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
const live = !!process.env.E2E_LIVE;

test.skip(!live, "live-domain smoke — set E2E_LIVE=1");

test("homepage canonical + og:url use the production domain", async ({ request }) => {
  const res = await request.get("/");
  expect(res.status()).toBe(200);
  const html = await res.text();
  const canonical = /rel="canonical" href="([^"]+)"/.exec(html)?.[1];
  expect(canonical?.replace(/\/$/, "")).toBe(base);
  const ogUrl = /property="og:url" content="([^"]+)"/.exec(html)?.[1];
  expect(ogUrl?.replace(/\/$/, "")).toBe(base);
  expect(html).not.toContain("wcag-score.ascent.partners");
});

test("robots.txt sitemap uses the production domain", async ({ request }) => {
  const res = await request.get("/robots.txt");
  const body = await res.text();
  expect(body).toContain(`Sitemap: ${base}/sitemap.xml`);
  expect(body).not.toContain("wcag-score");
});

test("sitemap.xml locs use the production domain", async ({ request }) => {
  const res = await request.get("/sitemap.xml");
  expect(res.status()).toBe(200);
  const body = await res.text();
  expect(body).toContain(`<loc>${base}</loc>`);
  expect(body).toContain(`<loc>${base}/`);
  expect(body).not.toContain("wcag-score");
});

test("GitHub OAuth start redirects with the production-domain callback", async ({ request }) => {
  const res = await request.get("/api/auth/oauth/github", { maxRedirects: 0 });
  expect(res.status()).toBe(307);
  const location = res.headers()["location"] ?? "";
  const params = new URLSearchParams(location.split("?")[1] ?? "");
  expect(params.get("redirect_uri")).toBe(`${base}/api/auth/oauth/github/callback`);
});

test("Microsoft OAuth start redirects with the production-domain callback", async ({ request }) => {
  const res = await request.get("/api/auth/oauth/microsoft", { maxRedirects: 0 });
  expect(res.status()).toBe(307);
  const location = res.headers()["location"] ?? "";
  const params = new URLSearchParams(location.split("?")[1] ?? "");
  expect(params.get("redirect_uri")).toBe(`${base}/api/auth/oauth/microsoft/callback`);
});

test("security headers are present", async ({ request }) => {
  const res = await request.get("/");
  expect(res.headers()["content-security-policy"]).toContain("default-src 'self'");
  expect(res.headers()["strict-transport-security"]).toContain("includeSubDomains");
  expect(res.headers()["x-frame-options"]).toBe("SAMEORIGIN");
  expect(res.headers()["x-content-type-options"]).toBe("nosniff");
});

test("key assets load", async ({ request }) => {
  for (const path of ["/favicon.png", "/images/og-image.png", "/images/apf-logo.png"]) {
    const res = await request.get(path);
    expect(res.status(), `${path} should be 200`).toBe(200);
  }
});
