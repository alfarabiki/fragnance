import { test, expect } from "@playwright/test";

test("customer can add multiple perfumes to cart before checking out", async ({ page }) => {
  await page.goto("/buat-parfum");
  await page.waitForLoadState("networkidle");

  // Add the default fragrance (Dior-inspired) to cart — should stay on the page.
  await page.getByRole("button", { name: /Tambah ke Keranjang/i }).click();
  await expect(page.getByText("✓ Masuk keranjang")).toBeVisible({ timeout: 3000 });
  await expect(page).toHaveURL(/\/buat-parfum/);

  // Switch to a different fragrance and add that too.
  await page.getByRole("button", { name: "Woody Fresh" }).click();
  await page.getByRole("button", { name: /Tambah ke Keranjang/i }).click();
  await expect(page.getByText("✓ Masuk keranjang")).toBeVisible({ timeout: 3000 });
  await expect(page).toHaveURL(/\/buat-parfum/);

  // Open the cart drawer via the cart icon and confirm both items are there.
  await page.getByRole("button", { name: "Buka keranjang" }).click();
  const drawer = page.getByLabel("Keranjang belanja");
  await expect(drawer.getByText("Dior-inspired")).toBeVisible();
  await expect(drawer.getByText("Woody Fresh")).toBeVisible();
});
