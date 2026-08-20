import { expect, test } from "@playwright/test";

// Auth plumbing that depends on the production domain (no provider login
// required): OAuth callback fail-safe and session-gated route protection.
const base = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
const live = !!process.env.E2E_LIVE;

test.skip(!live, "live-domain auth checks — set E2E_LIVE=1");

test("OAuth callback rejects a tampered state and redirects to sign-in", async ({ request }) => {
  const res = await request.get(
    "/api/auth/oauth/github/callback?code=fake&state=tampered",
    { maxRedirects: 0 },
  );
  expect(res.status()).toBe(307);
  expect(res.headers()["location"]).toBe(`${base}/sign-in?error=oauth`);
});

test("OAuth callback rejects a missing code and redirects to sign-in", async ({ request }) => {
  const res = await request.get("/api/auth/oauth/github/callback", { maxRedirects: 0 });
  expect(res.status()).toBe(307);
  expect(res.headers()["location"]).toBe(`${base}/sign-in?error=oauth`);
});

test("whole-site scan page requires a session", async ({ request }) => {
  const res = await request.get("/site", { maxRedirects: 0 });
  expect(res.status()).toBe(307);
  expect(res.headers()["location"]).toContain("/sign-in");
});

test("account page requires a session", async ({ request }) => {
  const res = await request.get("/account", { maxRedirects: 0 });
  expect(res.status()).toBe(307);
  expect(res.headers()["location"]).toContain("/sign-in");
});

test("assessment API returns 401 without a session or key", async ({ request }) => {
  const res = await request.post("/api/v1/assessments", {
    data: { url: "https://example.com", standard: "WCAG 2.2 AA" },
  });
  expect(res.status()).toBe(401);
});

test("subscribe API returns 401 without a session", async ({ request }) => {
  const res = await request.post("/api/subscribe");
  expect(res.status()).toBe(401);
});

test("Stripe webhook rejects a request with no signature", async ({ request }) => {
  const res = await request.post("/api/webhooks/stripe", { data: "{}" });
  expect(res.status()).toBe(400);
});

test("Stripe webhook rejects a tampered signature", async ({ request }) => {
  const res = await request.post("/api/webhooks/stripe", {
    headers: { "stripe-signature": "t=1234,v1=deadbeef" },
    data: "{}",
  });
  expect(res.status()).toBe(400);
});
