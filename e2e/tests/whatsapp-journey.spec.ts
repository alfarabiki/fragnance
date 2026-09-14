import { test, expect } from "@playwright/test";
import { TEST_CONFIG } from "../test-config";

test("Complete WhatsApp order journey", async ({ page }) => {
  await page.goto(TEST_CONFIG.urls.home);

  await expect(page).toHaveTitle(TEST_CONFIG.storefront.title);
  await expect(page.getByText(TEST_CONFIG.storefront.ctaText).first()).toBeVisible();
});