import { expect, test } from "@playwright/test";

test("assess requires sign-in and redirects to the sign-in form", async ({ page }) => {
  await page.goto("/assess");
  await expect(page).toHaveURL(/\/sign-in/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Sign in");
  await expect(page.getByLabel("Email")).toBeVisible();
});
