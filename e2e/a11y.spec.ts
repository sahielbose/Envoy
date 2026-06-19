import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

async function scan(page: import("@playwright/test").Page) {
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
  return results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
}

test("landing page has no serious/critical a11y violations", async ({ page }) => {
  await page.goto("/");
  expect(await scan(page)).toEqual([]);
});

test("styleguide has no serious/critical a11y violations", async ({ page }) => {
  await page.goto("/styleguide");
  expect(await scan(page)).toEqual([]);
});
