import { describe, expect, it } from "vitest";
import { formatRupiah } from "./format-rupiah";

describe("formatRupiah", () => {
  it("formats thousands with a dot separator", () => {
    expect(formatRupiah(29000)).toBe("Rp29.000");
    expect(formatRupiah(89500)).toBe("Rp89.500");
  });

  it("formats zero", () => {
    expect(formatRupiah(0)).toBe("Rp0");
  });

  it("never renders decimals", () => {
    expect(formatRupiah(29999)).toBe("Rp29.999");
    expect(formatRupiah(1000)).toBe("Rp1.000");
  });

  it("supports the Mulai dari prefix", () => {
    expect(formatRupiah(29000, { prefix: true })).toBe("Mulai dari Rp29.000");
  });

  it("inserts a non-breaking space before Rp when useNbsp is set", () => {
    expect(formatRupiah(29000, { useNbsp: true })).toBe("\u00A0Rp29.000");
    expect(formatRupiah(29000, { useNbsp: true, prefix: true })).toBe(
      "Mulai dari \u00A0Rp29.000",
    );
  });

  it("clamps negative amounts to zero", () => {
    expect(formatRupiah(-5)).toBe("Rp0");
  });
});
