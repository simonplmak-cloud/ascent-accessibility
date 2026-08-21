import { expect, test } from "@playwright/test";

test("landing page renders the value proposition and links to the tool", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("accessibility");
  await expect(page.getByRole("link", { name: /Start an assessment/i })).toBeVisible();
});

test("landing page exposes a skip link", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: "Skip to main content" })).toBeAttached();
});

test("about page is reachable from the header", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Primary").getByRole("link", { name: "About" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("About");
});
