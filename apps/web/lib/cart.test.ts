import { describe, expect, it } from "vitest";
import { cartSubtotal, reconfigureItem, type CartItem } from "./cart";

const standard50: CartItem = {
  itemId: "casablanca:50:25:b50:standard",
  fragranceId: "casablanca",
  fragranceName: "Casablanca",
  volumeMl: 50,
  fragranceMl: 25,
  bottleId: "b50",
  bottleName: "Standard 50 ml",
  packagingId: "standard",
  packagingName: "Standard",
  unitPrice: 52_000,
  quantity: 1,
};

describe("reconfigureItem", () => {
  it("replaces an item with its newly priced size, strength, and bottle configuration", () => {
    const result = reconfigureItem([standard50], standard50.itemId, {
      ...standard50,
      volumeMl: 30,
      fragranceMl: 15,
      bottleId: "b30-premium",
      bottleName: "Premium 30 ml",
      unitPrice: 44_000,
    });

    expect(result).toEqual([
      expect.objectContaining({
        itemId: "casablanca:30:15:b30-premium:standard",
        volumeMl: 30,
        fragranceMl: 15,
        bottleName: "Premium 30 ml",
        unitPrice: 44_000,
        quantity: 1,
      }),
    ]);
    expect(cartSubtotal(result)).toBe(44_000);
  });

  it("merges quantities when the new configuration already exists in the cart", () => {
    const premium30: CartItem = {
      ...standard50,
      itemId: "casablanca:30:15:b30-premium:standard",
      volumeMl: 30,
      fragranceMl: 15,
      bottleId: "b30-premium",
      bottleName: "Premium 30 ml",
      unitPrice: 40_000,
      quantity: 2,
    };

    const result = reconfigureItem([standard50, premium30], standard50.itemId, {
      ...premium30,
      unitPrice: 44_000,
    });

    expect(result).toEqual([
      expect.objectContaining({ itemId: premium30.itemId, quantity: 3, unitPrice: 44_000 }),
    ]);
    expect(cartSubtotal(result)).toBe(132_000);
  });
});
