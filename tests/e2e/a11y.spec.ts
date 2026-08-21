import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const pages = [
  { path: "/", name: "landing" },
  { path: "/assess", name: "assess" },
  { path: "/donate", name: "donate" },
  { path: "/training", name: "training" },
  { path: "/training/lessons/how-wcag-works", name: "wcag" },
  { path: "/training/lessons/understanding-severity", name: "severity" },
  { path: "/training/lessons/contrast", name: "contrast" },
  { path: "/training/paths/web-accessibility-foundation", name: "path" },
];

for (const target of pages) {
  test(`${target.name} page has no axe violations (AC-7)`, async ({ page }) => {
    await page.goto(target.path);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
}

test("assess redirects to a usable sign-in page at a narrow viewport (AC-8)", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/assess");
  await expect(page).toHaveURL(/\/sign-in/);
  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(page.getByRole("button", { name: /Email me a login link/i })).toBeVisible();
});
