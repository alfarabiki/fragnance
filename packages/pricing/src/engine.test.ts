import { describe, it, expect } from "vitest";
import { calculate, PricingError } from "./engine";
import type { PricingConfig } from "./engine";

function baseConfig(overrides: Partial<PricingConfig> = {}): PricingConfig {
  return {
    fragrance: {
      id: "dior",
      name: "Dior-inspired",
      pricePerMl: 3000,
      minMl: 5,
      maxMl: 50,
    },
    alcohol: { pricePerMl: 300 },
    bottle: { id: "b50", name: "50 ml Standard", volumeMl: 50, price: 11000, active: true },
    packaging: { id: "standard", name: "Standard", price: 5000, mandatory: false, active: true },
    volumeMl: 50,
    fragranceMl: 20,
    ...overrides,
  };
}

describe("Pricing engine (spec §107 + pricing-engine.md)", () => {
  it("matches the canonical example: 20ml×3000 + 30ml×300 + bottle 11000 + packaging 5000 = 85000", () => {
    const q = calculate(baseConfig());
    expect(q.total).toBe(85000);
    expect(q.subtotal).toBe(85000);
  });

  it("computes the spec §15 example: 20ml×3000 + 30ml×300 + premium 15000 + standard 5000 = 89000", () => {
    const q = calculate(
      baseConfig({ bottle: { id: "p50", name: "Premium", volumeMl: 50, price: 15000, active: true } }),
    );
    expect(q.total).toBe(89000);
    expect(q.lineItems.fragrance.amount).toBe(60000);
    expect(q.lineItems.alcohol.amount).toBe(9000);
    expect(q.lineItems.bottle.amount).toBe(15000);
    expect(q.lineItems.packaging.amount).toBe(5000);
  });

  it("allows fragrance at the minimum", () => {
    const q = calculate(baseConfig({ fragranceMl: 5 }));
    expect(q.total).toBeGreaterThan(0);
  });

  it("allows fragrance at the maximum", () => {
    const q = calculate(baseConfig({ fragranceMl: 50 }));
    expect(q.lineItems.alcohol.quantityMl).toBe(0);
    expect(q.total).toBeGreaterThan(0);
  });

  it("rejects fragrance below minimum", () => {
    expect(() => calculate(baseConfig({ fragranceMl: 1 }))).toThrow(PricingError);
    expect(() => calculate(baseConfig({ fragranceMl: 1 }))).toThrow(/below min/);
  });

  it("rejects fragrance above maximum", () => {
    expect(() => calculate(baseConfig({ fragranceMl: 51 }))).toThrow(PricingError);
  });

  it("rejects zero fragranceMl", () => {
    expect(() => calculate(baseConfig({ fragranceMl: 0 }))).toThrow(PricingError);
  });

  it("rejects bottle volume mismatch", () => {
    expect(() =>
      calculate(
        baseConfig({ bottle: { id: "b30", name: "30 ml", volumeMl: 30, price: 9000, active: true }, volumeMl: 50 }),
      ),
    ).toThrow(PricingError);
  });

  it("rejects unavailable (inactive) bottle", () => {
    expect(() =>
      calculate(
        baseConfig({ bottle: { id: "b50", name: "50 ml Standard", volumeMl: 50, price: 11000, active: false } }),
      ),
    ).toThrow(PricingError);
  });

  it("applies discount capped at subtotal", () => {
    const q = calculate(baseConfig({ discount: 200000 }));
    expect(q.discount).toBe(q.subtotal);
    expect(q.total).toBe(0);
  });

  it("adds shipping after discount", () => {
    const q = calculate(baseConfig({ shipping: 10000, discount: 5000 }));
    expect(q.shipping).toBe(10000);
    expect(q.total).toBe(q.subtotal - q.discount + q.shipping);
  });

  it("keeps money as integers (no decimals)", () => {
    const q = calculate(baseConfig({ fragranceMl: 7, fragrance: { ...baseConfig().fragrance, pricePerMl: 3333 } }));
    expect(q.lineItems.fragrance.amount % 1).toBe(0);
  });
});