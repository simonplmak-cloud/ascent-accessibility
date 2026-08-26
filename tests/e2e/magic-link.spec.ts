import { expect, test } from "@playwright/test";
import { createMailtmInbox, extractLink, waitForMessage } from "./helpers/mailtm";

// Full magic-link sign-in against the live domain (Resend integration). Gated
// behind E2E_RESEND because it requires a verified Resend sender domain.
const base = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
const live = !!process.env.E2E_LIVE;
const resend = !!process.env.E2E_RESEND;

test.skip(!live || !resend, "requires E2E_LIVE=1 and a verified Resend domain (E2E_RESEND=1)");

test("magic-link email links to the production domain and signs in", async ({ request, page }) => {
  const inbox = await createMailtmInbox();

  const submit = await request.post("/api/auth/magic-link", {
    data: { email: inbox.address },
  });
  expect(submit.status()).toBe(200);

  const message = await waitForMessage(inbox);
  const link = extractLink(message);
  expect(link).toContain(`${base}/api/auth/magic-link/callback`);
  expect(link).not.toContain("wcag-score");

  await page.goto(link);
  await page.waitForURL(/\/assess/);

  const cookies = await page.context().cookies();
  expect(cookies.find((c) => c.name === "wcag_session")).toBeTruthy();
});
