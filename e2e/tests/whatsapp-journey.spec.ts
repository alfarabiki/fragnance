import { test, expect } from "@playwright/test";

test("Complete WhatsApp order journey", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/ATLASE/);
  await expect(page.getByText("PREMIUM FRAGRANCE.")).toBeVisible();
  await expect(page.getByText("Mulai dari Rp29.000").first()).toBeVisible();
  await expect(page.getByText("Pilih Aroma").first()).toBeVisible();
});