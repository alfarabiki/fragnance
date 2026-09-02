import { describe, it, expect } from "vitest";
import { buildWhatsAppMessage, buildWhatsAppLink } from "./whatsapp";
import { upsertItem, removeItem, setQuantity, cartSubtotal } from "./cart";
import type { CartItemConfig } from "./cart";

const sampleItem: CartItemConfig = {
  fragranceId: "dior-sauvage",
  fragranceName: "Dior-inspired",
  volumeMl: 50,
  fragranceMl: 20,
  bottleId: "b50-p",
  bottleName: "Premium 50 ml",
  packagingId: "pkg-standard",
  packagingName: "Standard",
  unitPrice: 89000,
};

const address = {
  recipientName: "Budi",
  phone: "081234567890",
  fullAddress: "Jl. Wolter Monginsidi No. 21",
  district: "Kebayoran Baru",
  city: "Jakarta Selatan",
  province: "DKI Jakarta",
  postalCode: "12110",
};

describe("cart helpers", () => {
  it("upserts new items and increments matching ones", () => {
    const a = upsertItem([], sampleItem);
    expect(a).toHaveLength(1);
    expect(a[0]!.quantity).toBe(1);
    const b = upsertItem(a, sampleItem);
    expect(b).toHaveLength(1);
    expect(b[0]!.quantity).toBe(2);
  });

  it("removes by itemId and clamps quantity to 1..20", () => {
    const a = upsertItem([], sampleItem);
    const removed = removeItem(a, a[0]!.itemId);
    expect(removed).toHaveLength(0);

    const b = upsertItem([], sampleItem);
    const q1 = setQuantity(b, b[0]!.itemId, 0);
    expect(q1[0]!.quantity).toBe(1);
    const q2 = setQuantity(b, b[0]!.itemId, 99);
    expect(q2[0]!.quantity).toBe(20);
  });

  it("computes subtotal", () => {
    const a = upsertItem([], { ...sampleItem, unitPrice: 85000 });
    const two = upsertItem(a, { ...sampleItem, unitPrice: 85000 });
    expect(cartSubtotal(two)).toBe(170000);
  });
});

describe("whatsapp message (§6 template)", () => {
  it("builds structured message with order number and total", () => {
    const msg = buildWhatsAppMessage({
      orderNumber: "ATL-260901-000128",
      items: [{ ...sampleItem, itemId: "x", quantity: 1 }],
      total: 89000,
      customer: { name: "Budi", phone: "081234567890" },
      address,
    });

    expect(msg).toContain("Halo Atlase, saya ingin memesan:");
    expect(msg).toContain("#ATL-260901-000128");
    expect(msg).toContain("Dior-inspired");
    expect(msg).toContain("50 ml");
    expect(msg).toContain("20 ml");
    expect(msg).toContain("Kekuatan:");
    expect(msg).toContain("Sedang");
    expect(msg).toContain("Premium 50 ml");
    expect(msg).toContain("Rp89.000");
    expect(msg).toContain("Budi");
    expect(msg).toContain("Jl. Wolter Monginsidi No. 21");
    expect(msg).toContain("Jakarta Selatan");
    expect(msg).toContain("DKI Jakarta");
    expect(msg).toContain("12110");
    expect(msg).toContain("Mohon dibantu proses pesanannya.");
  });

  it("normalizes phone to +62 and encodes message", () => {
    const msg = "Halo Atlase, saya ingin memesan:";
    const link = buildWhatsAppLink("081234567890", msg);
    expect(link).toContain("wa.me/6281234567890");
    expect(link).toContain("text=");
  });
});