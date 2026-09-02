import { test, expect } from "@playwright/test";

test("QRIS payment journey - landing renders affordable price", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/ATLASE/);
  await expect(page.getByText(/Premium Fragrance|PREMIUM FRAGRANCE/i)).toBeVisible();
  await expect(page.getByText(/Mulai dari Rp29\.000/).first()).toBeVisible();
  await expect(page.getByRole("link", { name: /Pesan via WhatsApp/i })).toBeVisible();
});