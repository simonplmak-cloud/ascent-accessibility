import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

// The API keys page is a server component that reads from SurrealDB and requires
// a signed-in subscriber, so these tests require the full stack.
test.skip(!process.env.E2E_FULL_STACK, "requires the full stack (SurrealDB + subscriber auth)");

interface Key {
  id: string;
  name: string;
  keyPrefix: string;
  status: "active" | "revoked";
  rateLimit: number;
}

async function mockApiKeys(page: Page, keys: Key[]) {
  await page.route("**/api/v1/api-keys", async (route) => {
    const method = route.request().method();
    if (method === "GET") {
      await route.fulfill({ json: keys });
    } else if (method === "POST") {
      await route.fulfill({
        json: { id: "api_key:new", key: "ak_abc123_rest_of_key", keyPrefix: "ak_abc123_re" },
      });
    } else {
      await route.continue();
    }
  });
  await page.route("**/api/v1/api-keys/*", async (route) => {
    if (route.request().method() === "DELETE") {
      await route.fulfill({ json: { ok: true } });
    } else {
      await route.continue();
    }
  });
}

test("api keys page lists keys with prefix and status (AC-2)", async ({ page }) => {
  await mockApiKeys(page, [
    { id: "api_key:1", name: "CI", keyPrefix: "ak_ci_1234", status: "active", rateLimit: 60 },
    { id: "api_key:2", name: "Staging", keyPrefix: "ak_st_abcd", status: "revoked", rateLimit: 120 },
  ]);
  await page.goto("/api-keys");

  await expect(page.getByRole("heading", { name: "API access" })).toBeVisible();
  await expect(page.getByText("CI")).toBeVisible();
  await expect(page.getByText("ak_ci_1234…")).toBeVisible();
  await expect(page.getByText("ACTIVE")).toBeVisible();
  await expect(page.getByText("REVOKED")).toBeVisible();
});

test("api keys page shows the raw key exactly once on create (AC-2)", async ({ page }) => {
  await mockApiKeys(page, []);
  await page.goto("/api-keys");

  await page.getByLabel("Key name").fill("CI");
  await page.getByRole("button", { name: "Create key" }).click();

  await expect(page.getByText(/won't be shown again/i)).toBeVisible();
  await expect(page.getByText("ak_abc123_rest_of_key")).toBeVisible();
});

test("api keys page revokes a key (AC-2)", async ({ page }) => {
  await mockApiKeys(page, [
    { id: "api_key:1", name: "CI", keyPrefix: "ak_ci_1234", status: "active", rateLimit: 60 },
  ]);
  await page.goto("/api-keys");

  await page.getByRole("button", { name: "Revoke" }).click();

  await expect(page.getByText("Key revoked.")).toBeVisible();
});

test("api keys page has no axe violations", async ({ page }) => {
  await mockApiKeys(page, [
    { id: "api_key:1", name: "CI", keyPrefix: "ak_ci_1234", status: "active", rateLimit: 60 },
  ]);
  await page.goto("/api-keys");

  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
