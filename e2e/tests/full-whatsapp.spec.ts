import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/buat-parfum");
  await page.waitForLoadState("networkidle");
});

test("full WhatsApp journey: build → cart → address → whatsapp handoff", async ({ page }) => {
  // Build a perfume (Dior-inspired default, 50ml, Kuat=35ml)
  await page.getByRole("button", { name: "Kuat" }).click();
  await expect(page.getByText("35 ml").first()).toBeVisible();

  // Add to cart via "Lanjut Pesan"
  await page.getByRole("button", { name: /Lanjut Pesan/i }).click();
  await expect(page.getByText("✓ Masuk keranjang")).toBeVisible({ timeout: 3000 });

  // Should navigate to /checkout
  await page.waitForURL("**/checkout");
  await expect(page.getByText("Pesananmu").first()).toBeVisible();
  await expect(page.getByText("Dior-inspired").first()).toBeVisible();

  // Go to address step
  await page.getByRole("button", { name: /Lanjut Isi Alamat/i }).click();
  await expect(page.getByText("Alamat Pengiriman").first()).toBeVisible();

  // Fill the form
  await page.fill('input[placeholder="Nama lengkap"]', "Budi Santoso");
  await page.fill('input[placeholder="08xx"]', "081234567890");
  await page.fill('input[placeholder="e.g. DKI Jakarta"]', "DKI Jakarta");
  await page.fill('input[placeholder="e.g. Jakarta Selatan"]', "Jakarta Selatan");
  await page.fill('input[placeholder="e.g. Kebayoran Baru"]', "Kebayoran Baru");
  await page.fill('input[placeholder="5 digit"]', "12110");
  await page.fill('textarea[placeholder^="Nama jalan"]', "Jl. Wolter Monginsidi No. 21");

  await page.getByRole("button", { name: /Lanjut Cara Pesan/i }).click();

  // Choose WhatsApp
  await expect(page.getByText("Cara Pesan").first()).toBeVisible();
  await page.getByRole("button", { name: /Pesan via WhatsApp/i }).click();

  // Payment page — WhatsApp handoff with wa.me link
  await page.waitForURL("**/payment?channel=whatsapp**");
  const link = page.locator('a[href^="https://wa.me"]');
  await expect(link).toBeVisible();
  const href = (await link.getAttribute("href")) || "";
  expect(href).toContain("wa.me/6287887753802");
  expect(href).toContain("Dior-inspired");
  expect(href).toContain("ATL-");

  // Complete handoff → success
  await page.getByRole("button", { name: /Saya sudah mengirim pesanan/i }).click();
  await page.waitForURL("**/order-sukses**");
  await expect(page.getByText("Terima kasih atas pesananmu!").first()).toBeVisible();
});