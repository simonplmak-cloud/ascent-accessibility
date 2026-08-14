import { expect, test } from "@playwright/test";

test("assessment form renders a labelled URL input and standard selector", async ({ page }) => {
  await page.goto("/assess");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Assess");
  await expect(page.getByLabel("Website URL")).toBeVisible();
  await expect(page.getByLabel("Standard")).toBeVisible();
  await expect(page.getByRole("button", { name: /Run assessment/i })).toBeVisible();
});
