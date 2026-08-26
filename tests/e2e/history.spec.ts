import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

type Status = "queued" | "running" | "completed" | "failed";
type Conformance = "conforms" | "does-not-conform" | "undetermined" | null;

interface Item {
  id: string;
  url: string;
  standard: string;
  status: Status;
  conformance: Conformance;
  pagesScanned: number;
  partial: boolean;
  createdAt: string;
  updatedAt: string;
}

function makeItems(): Item[] {
  return [
    item("a1", "https://ascent-partners.com", "completed", "does-not-conform", "2026-08-14T09:12:00Z"),
    item("a2", "https://ascent-partners.com", "completed", "does-not-conform", "2026-08-01T09:12:00Z"),
    item("b1", "https://checkout.northwind-retail.com", "completed", "conforms", "2026-08-13T02:30:00Z"),
    item("c1", "https://app.fintrack.io/dashboard", "failed", null, "2026-08-12T08:05:00Z"),
    item("d1", "https://portal.meridian-health.org", "queued", null, "2026-08-15T08:00:00Z"),
  ];
}

function item(
  id: string,
  url: string,
  status: Status,
  conformance: Conformance,
  createdAt: string,
): Item {
  return {
    id: `assessment:${id}`,
    url,
    standard: "WCAG 2.2 AA",
    status,
    conformance,
    pagesScanned: status === "completed" ? 12 : 0,
    partial: false,
    createdAt,
    updatedAt: createdAt,
  };
}

async function mockHistoryApi(page: Page, items: Item[]) {
  await page.route("**/api/v1/assessments", async (route) => {
    const method = route.request().method();
    if (method === "GET") {
      await route.fulfill({ json: { assessments: items } });
    } else if (method === "POST") {
      await route.fulfill({
        json: { id: "assessment:new", status: "queued", url: "https://x.example", standard: "WCAG 2.2 AA" },
      });
    } else {
      await route.continue();
    }
  });
  await page.route("**/api/v1/assessments/*", async (route) => {
    if (route.request().method() === "DELETE") {
      await route.fulfill({ json: { ok: true } });
    } else {
      await route.continue();
    }
  });
}

test("auditor page lists assessments with URL, standard, status, conformance and date (AC-3)", async ({ page }) => {
  const items = makeItems();
  await mockHistoryApi(page, items);
  await page.goto("/auditor");

  await expect(page.getByRole("heading", { name: "Assessments" })).toBeVisible();
  const table = page.locator("tbody");
  await expect(table.getByText("ascent-partners.com").first()).toBeVisible();
  await expect(table.getByText("checkout.northwind-retail.com")).toBeVisible();
  await expect(table.getByText("FAILED", { exact: true })).toBeVisible();
  await expect(table.getByText("QUEUED", { exact: true })).toBeVisible();
  await expect(table.getByText("Does not conform", { exact: true }).first()).toBeVisible();
  await expect(table.getByText("Conforms", { exact: true })).toBeVisible();
});

test("auditor page filters by status (AC-6)", async ({ page }) => {
  await mockHistoryApi(page, makeItems());
  await page.goto("/auditor");

  await page.getByLabel("Filter").selectOption("failed");
  const table = page.locator("tbody");
  await expect(table.getByText("app.fintrack.io/dashboard")).toBeVisible();
  await expect(table.getByText("ascent-partners.com")).toHaveCount(0);
});

test("auditor page sorts by conformance (AC-6)", async ({ page }) => {
  await mockHistoryApi(page, makeItems());
  await page.goto("/auditor");

  await page.getByRole("button", { name: /Conformance/ }).click();
  const firstConformance = page.locator("tbody tr").first().locator("td").nth(1);
  await expect(firstConformance).toHaveText("Conforms");
});

test("auditor page shows a conformance trend for a repeated URL (AC-8)", async ({ page }) => {
  await mockHistoryApi(page, makeItems());
  await page.goto("/auditor");

  await expect(page.getByRole("heading", { name: "Conformance trend" })).toBeVisible();
  const comparison = page.getByText("ascent-partners.com").nth(1);
  await expect(comparison).toBeVisible();
});

test("auditor page deletes an assessment (AC-7)", async ({ page }) => {
  const items = makeItems();
  await mockHistoryApi(page, items);
  page.on("dialog", (dialog) => dialog.accept());
  await page.goto("/auditor");

  const row = page.locator("tbody tr", { hasText: "checkout.northwind-retail.com" });
  await row.getByRole("button", { name: "Delete" }).click();

  await expect(page.getByText("Assessment deleted.")).toBeVisible();
});

test("auditor page re-runs an assessment (AC-5)", async ({ page }) => {
  await mockHistoryApi(page, makeItems());
  await page.goto("/auditor");

  const row = page.locator("tbody tr", { hasText: "ascent-partners.com" }).first();
  await row.getByRole("button", { name: "Re-run" }).click();

  await expect(page.getByText(/Re-run queued/)).toBeVisible();
});

test("auditor page has no horizontal scroll at narrow viewport (AC-1)", async ({ page }) => {
  await mockHistoryApi(page, makeItems());
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/auditor");

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(overflow).toBe(false);
});

test("auditor page has no axe violations", async ({ page }) => {
  await mockHistoryApi(page, makeItems());
  await page.goto("/auditor");
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
