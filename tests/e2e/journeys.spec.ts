import { expect, test } from "@playwright/test";
import { createMailtmInbox, extractLink, waitForMessage } from "./helpers/mailtm";

// Authenticated user journeys against the live domain. Requires a verified
// Resend sender (magic-link sign-in) and a running worker + browserless for the
// assessment scan to complete.
const live = !!process.env.E2E_LIVE;
const resend = !!process.env.E2E_RESEND;

test.skip(!live || !resend, "requires E2E_LIVE=1 and E2E_RESEND=1");

async function signInViaMagicLink(page: import("@playwright/test").Page) {
  const inbox = await createMailtmInbox();
  const submit = await page.request.post("/api/auth/magic-link", {
    data: { email: inbox.address },
  });
  expect(submit.status()).toBe(200);

  const message = await waitForMessage(inbox);
  const link = extractLink(message);
  await page.goto(link);
  await page.waitForURL(/\/assess/);

  const cookies = await page.context().cookies();
  expect(cookies.find((c) => c.name === "wcag_session")).toBeTruthy();
}

test("signed-in user runs an assessment, manages API keys, and starts a subscription", async ({
  page,
}) => {
  test.setTimeout(300_000);
  await signInViaMagicLink(page);

  // Assessment — full pipeline: Vercel -> SurrealDB -> worker -> browserless.
  const create = await page.request.post("/api/v1/assessments", {
    data: { url: "https://example.com", standard: "wcag22aa", scope: "page" },
  });
  expect(create.status()).toBe(202);
  const { id } = (await create.json()) as { id: string };
  expect(id).toMatch(/^assessment:/);

  let status = "queued";
  const deadline = Date.now() + 240_000;
  while (Date.now() < deadline && status !== "completed" && status !== "failed") {
    await page.waitForTimeout(5000);
    const poll = await page.request.get(`/api/v1/assessments/${id}`);
    if (poll.status() === 200) {
      status = ((await poll.json()) as { status: string }).status;
    }
  }
  expect(status).toBe("completed");

  // API keys — issue + list.
  const key = await page.request.post("/api/v1/api-keys", {
    data: { name: "e2e-journey" },
  });
  expect(key.status()).toBe(201);
  const keyBody = (await key.json()) as { key: string; keyPrefix: string };
  expect(keyBody.key).toMatch(/^ak_/);
  expect(keyBody.keyPrefix).toBe(keyBody.key.slice(0, 11));

  const list = await page.request.get("/api/v1/api-keys");
  expect(list.status()).toBe(200);
  expect(JSON.stringify(await list.json())).toContain(keyBody.keyPrefix);

  // Subscription checkout — Stripe (embedded Payment Element client secret).
  const sub = await page.request.post("/api/subscribe");
  expect(sub.status()).toBe(200);
  const subBody = (await sub.json()) as { clientSecret: string };
  expect(subBody.clientSecret).toContain("secret_");
});
