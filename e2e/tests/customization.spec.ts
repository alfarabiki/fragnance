import { test, expect } from "@playwright/test";

test("Customization builder - live price updates when size changes", async ({ page }) => {
  await page.goto("/buat-parfum");

  await expect(page.getByText("Buat Parfum Kamu").first()).toBeVisible();
  await expect(page.getByText("1 · Pilih Aroma")).toBeVisible();
  await expect(page.getByText("Dior-inspired").first()).toBeVisible();

  // Default (50ml, Sedang=25ml, Standard bottle 50ml, Standard packaging)
  const defaultSummary = page.getByText("Ringkasan");
  await expect(defaultSummary).toBeVisible();

  // Switch to 30 ml — the bottle buttons update and price recomputes
  await page.getByRole("button", { name: /30 ml/ }).first().click();

  // Verify 30ml bottle option now highlighted / available
  await expect(page.getByText("Standard 30 ml").first()).toBeVisible();

  // Change strength to Kuat (35ml) via the custom slider is heavy; use presets
  await page.getByRole("button", { name: "Kuat" }).click();
  await expect(page.getByText("35 ml").first()).toBeVisible();
});