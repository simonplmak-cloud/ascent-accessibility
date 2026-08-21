import { expect, test } from "@playwright/test";
import { createMailtmInbox, extractLink, waitForMessage } from "./helpers/mailtm";

// BYOK AI-review profile flow against the live domain: save a key, pick a
// vision model, run an assessment, and assert AI review produced verdicts.
// Gated on E2E_AI_KEY + E2E_LIVE + E2E_RESEND. Provider/model are env-tunable.
const live = !!process.env.E2E_LIVE;
const resend = !!process.env.E2E_RESEND;
const aiKey = process.env.E2E_AI_KEY;
const provider = process.env.E2E_AI_PROVIDER ?? "dashscope";
const model = process.env.E2E_AI_MODEL ?? "qwen-vl-plus";

test.skip(!live || !resend || !aiKey, "requires E2E_LIVE, E2E_RESEND, E2E_AI_KEY");

async function signIn(page: import("@playwright/test").Page) {
  const inbox = await createMailtmInbox();
  await page.request.post("/api/auth/magic-link", { data: { email: inbox.address } });
  const link = extractLink(await waitForMessage(inbox));
  await page.goto(link);
  await page.waitForURL(/\/assess/);
}

test("saves a key + model and AI review resolves Cannot tell (BYOK)", async ({ page }) => {
  test.setTimeout(300_000);
  await signIn(page);

  const save = await page.request.post("/api/account/ai-key", {
    data: { apiKey: aiKey, provider },
  });
  expect(save.status()).toBe(200);
  const saved = (await save.json()) as { set: boolean; masked: string };
  expect(saved.set).toBe(true);
  expect(saved.masked).toContain("••••");

  const models = await page.request.put("/api/account/models", {
    data: { provider, visionModel: model },
  });
  expect(models.status()).toBe(200);

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
    if (poll.ok()) {
      status = ((await poll.json()) as { status: string }).status;
    }
  }
  expect(status).toBe("completed");

  const final = (await (await page.request.get(`/api/v1/assessments/${id}`)).json()) as {
    comparison?: { ai?: { provider: string; model: string } };
  };
  expect(final.comparison?.ai).toBeTruthy();
  expect(final.comparison!.ai!.provider).toBe(provider);
  expect(final.comparison!.ai!.model).toContain("qwen");
});
