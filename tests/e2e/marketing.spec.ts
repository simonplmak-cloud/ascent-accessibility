import { expect, test } from "@playwright/test";

test("landing page renders the value proposition and links to the tool", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("One in six");
  await expect(page.getByRole("link", { name: /Assess your site free/i }).first()).toBeVisible();
});

test("landing page exposes a skip link", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: "Skip to main content" })).toBeAttached();
});

test("about page is reachable from the header", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /About Us/ }).click();
  await page.locator("#dd-company").getByRole("link", { name: "Who we are" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("About");
});

test("pricing page shows the beta badge", async ({ page }) => {
  await page.goto("/pricing");
  await expect(page.getByText("Beta").first()).toBeVisible();
  await expect(page.getByText(/early-adopter beta/i).first()).toBeVisible();
});
