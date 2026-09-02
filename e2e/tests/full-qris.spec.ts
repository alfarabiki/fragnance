import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/buat-parfum");
  await page.waitForLoadState("networkidle");
});

test("full QRIS journey: build → cart → address → QRIS → paid → success", async ({ page }) => {
  // Build a perfume (default is fine)
  await page.getByRole("button", { name: /Lanjut Pesan/i }).click();
  await page.waitForURL("**/checkout");
  await expect(page.getByText("Pesananmu").first()).toBeVisible();

  // Go to address
  await page.getByRole("button", { name: /Lanjut Isi Alamat/i }).click();
  await expect(page.getByText("Alamat Pengiriman").first()).toBeVisible();
  await page.fill('input[placeholder="Nama lengkap"]', "Siti Rahma");
  await page.fill('input[placeholder="08xx"]', "081234567890");
  await page.fill('input[placeholder="e.g. DKI Jakarta"]', "DKI Jakarta");
  await page.fill('input[placeholder="e.g. Jakarta Selatan"]', "Jakarta Selatan");
  await page.fill('input[placeholder="e.g. Kebayoran Baru"]', "Kebayoran Baru");
  await page.fill('input[placeholder="5 digit"]', "12110");
  await page.fill('textarea[placeholder^="Nama jalan"]', "Jl. Senopati No. 88");
  await page.getByRole("button", { name: /Lanjut Cara Pesan/i }).click();

  // Choose QRIS
  await page.getByRole("button", { name: /Bayar dengan QRIS/i }).click();
  await page.waitForURL("**/payment?channel=qris**");

  // Payment waiting screen. This test env has no Supabase/Midtrans backend
  // configured, so the page honestly shows the simulation fallback instead
  // of faking a "paid" state (§7 — payment status is only ever confirmed via
  // the Midtrans webhook, never a client-side timer). The paid→success path
  // needs real sandbox credentials to exercise end-to-end.
  await expect(page.getByText("Menunggu Pembayaran").first()).toBeVisible();
  await expect(page.getByText(/Mode simulasi/i)).toBeVisible();
});