import { describe, it, expect } from "vitest";
import { reservationLines } from "./inventory";

describe("reservationLines", () => {
  it("sums quantity across items sharing the same bottle/packaging", () => {
    const lines = reservationLines([
      { bottleId: "b1", packagingId: "p1", quantity: 2 },
      { bottleId: "b1", packagingId: "p2", quantity: 1 },
    ]);
    expect(lines).toContainEqual({ itemType: "BOTTLE", itemId: "b1", qty: 3 });
    expect(lines).toContainEqual({ itemType: "PACKAGING", itemId: "p1", qty: 2 });
    expect(lines).toContainEqual({ itemType: "PACKAGING", itemId: "p2", qty: 1 });
  });

  it("skips items with an unresolved (null) catalog→DB id", () => {
    const lines = reservationLines([{ bottleId: null, packagingId: "p1", quantity: 1 }]);
    expect(lines).toEqual([{ itemType: "PACKAGING", itemId: "p1", qty: 1 }]);
  });

  it("returns an empty array for no items", () => {
    expect(reservationLines([])).toEqual([]);
  });
});
