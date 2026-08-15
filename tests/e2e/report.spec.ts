import { expect, test } from "@playwright/test";

// The shareable report page reads directly from SurrealDB (server component),
// so these tests require the full stack (app + SurrealDB) to be reachable.
test("unknown report id shows a not-found message (AC-4)", async ({ page }) => {
  await page.goto("/assess/assessment:does-not-exist");
  await expect(page.getByRole("heading", { name: "Assessment not found" })).toBeVisible();
});

test("not-found report page has no horizontal scroll at a narrow viewport (AC-1)", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/assess/assessment:does-not-exist");

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(overflow).toBe(false);
});
