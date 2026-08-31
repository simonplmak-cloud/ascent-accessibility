import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

async function openPreferences(page: Page) {
  // Display & language prefs now live on the visible /settings page.
  await page.goto("/settings");
}

test("defaults to the dark theme (AC-1)", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveClass(/dark/);
});

test("toggles to light and back to dark (AC-2, AC-3)", async ({ page }) => {
  await page.goto("/");
  await openPreferences(page);
  await page.getByRole("radio", { name: "Light" }).click();
  await expect(page.locator("html")).not.toHaveClass(/dark/);
  await page.getByRole("radio", { name: "Dark" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
});

test("persists the light theme across a reload (AC-4)", async ({ page }) => {
  await page.goto("/");
  await openPreferences(page);
  await page.getByRole("radio", { name: "Light" }).click();
  await page.reload();
  await expect(page.locator("html")).not.toHaveClass(/dark/);
});

test("light theme has no axe violations (AC-6)", async ({ page }) => {
  await page.goto("/");
  await openPreferences(page);
  await page.getByRole("radio", { name: "Light" }).click();
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
