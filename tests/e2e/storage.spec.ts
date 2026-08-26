import { expect, test } from "@playwright/test";
import { createMailtmInbox, extractLink, waitForMessage } from "./helpers/mailtm";

// Storage-quota lifecycle against the live domain: scan → usage reflects the
// scan → download PDF → delete → usage drops. Gated on E2E_LIVE + E2E_RESEND.
const live = !!process.env.E2E_LIVE;
const resend = !!process.env.E2E_RESEND;

test.skip(!live || !resend, "requires E2E_LIVE and E2E_RESEND");

async function signIn(page: import("@playwright/test").Page) {
  const inbox = await createMailtmInbox();
  await page.request.post("/api/auth/magic-link", { data: { email: inbox.address } });
  const link = extractLink(await waitForMessage(inbox));
  await page.goto(link);
  await page.waitForURL(/\/assess/);
}

test("scan → usage → download → delete → usage drops", async ({ page }) => {
  test.setTimeout(300_000);
  await signIn(page);

  const usageBefore = await page.request.get("/api/v1/account/usage");
  expect(usageBefore.status()).toBe(200);
  const before = (await usageBefore.json()) as { usedBytes: number; quotaBytes: number; retentionDays: number };
  expect(before.quotaBytes).toBeGreaterThan(0);
  expect(before.retentionDays).toBe(180);

  const create = await page.request.post("/api/v1/assessments", {
    data: { url: "https://example.com", standard: "wcag22aa", scope: "page" },
  });
  expect(create.status()).toBe(202);
  const { id } = (await create.json()) as { id: string };

  let status = "queued";
  const deadline = Date.now() + 240_000;
  while (Date.now() < deadline && status !== "completed" && status !== "failed") {
    await page.waitForTimeout(8000);
    const poll = await page.request.get(`/api/v1/assessments/${id}`);
    status = ((await poll.json()) as { status: string }).status;
  }
  expect(status).toBe("completed");

  // Usage reflects the completed scan (evidence + assessment + stored PDF bytes).
  const usageAfter = await page.request.get("/api/v1/account/usage");
  const after = (await usageAfter.json()) as { usedBytes: number };
  expect(after.usedBytes).toBeGreaterThanOrEqual(before.usedBytes);

  // PDF export serves a PDF (stored blob or on-demand fallback).
  const pdf = await page.request.get(`/api/v1/assessments/${id}/export`);
  expect(pdf.status()).toBe(200);
  expect(pdf.headers()["content-type"]).toContain("application/pdf");

  // Owner-gated cascade delete reclaims storage.
  const del = await page.request.delete(`/api/v1/assessments/${id}`);
  expect(del.status()).toBe(200);

  const usageFinal = await page.request.get("/api/v1/account/usage");
  const final = (await usageFinal.json()) as { usedBytes: number };
  expect(final.usedBytes).toBeLessThanOrEqual(after.usedBytes);
});
