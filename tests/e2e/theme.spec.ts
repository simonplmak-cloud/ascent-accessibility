import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("defaults to the dark theme (AC-1)", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveClass(/dark/);
});

test("toggles to light and back to dark (AC-2, AC-3)", async ({ page }) => {
  await page.goto("/");
  const toLight = page.getByRole("button", { name: "Switch to light theme" });
  await toLight.click();
  await expect(page.locator("html")).not.toHaveClass(/dark/);
  await expect(page.getByRole("button", { name: "Switch to dark theme" })).toBeVisible();
  await page.getByRole("button", { name: "Switch to dark theme" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
});

test("persists the light theme across a reload (AC-4)", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Switch to light theme" }).click();
  await page.reload();
  await expect(page.locator("html")).not.toHaveClass(/dark/);
});

test("light theme has no axe violations (AC-6)", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Switch to light theme" }).click();
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
