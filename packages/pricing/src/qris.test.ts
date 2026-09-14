import { describe, it, expect, vi } from "vitest";
import {
  crc16,
  extractMerchantName,
  validateStaticPayload,
  toDynamic,
  isConfigured,
  generateDynamic,
  getMdrRate,
  calculateServiceFee,
} from "./qris";

function buildStaticFixture(merchantName = "TOKO CONTOH"): string {
  const withTag = "000201" + "010211" + "59" + String(merchantName.length).padStart(2, "0") + merchantName + "5802ID" + "6304";
  return withTag + crc16(withTag);
}

describe("crc16", () => {
  it("deterministic", () => expect(crc16("000201")).toBe(crc16("000201")));
  it("always 4 uppercase hex", () => expect(crc16("anything")).toMatch(/^[0-9A-F]{4}$/));
});

describe("extractMerchantName", () => {
  it("reads tag 59", () => expect(extractMerchantName(buildStaticFixture("WARUNG MIZ"))).toBe("WARUNG MIZ"));
  it("empty when tag 59 absent", () => expect(extractMerchantName("000201010211")).toBe(""));
});

describe("validateStaticPayload", () => {
  it("accepts well-formed", () => expect(validateStaticPayload(buildStaticFixture())).toBeNull());
  it("rejects tampered CRC", () => {
    const f = buildStaticFixture();
    expect(validateStaticPayload(f.slice(0, -1) + (f.slice(-1) === "A" ? "B" : "A"))).toBeTruthy();
  });
  it("rejects missing header", () => expect(validateStaticPayload("1902010102115802ID")).toBeTruthy());
  it("rejects missing country", () => expect(validateStaticPayload("0002010102115911TOKO CONTOH")).toBeTruthy());
});

describe("toDynamic", () => {
  it("switches 11 -> 12", () => {
    const d = toDynamic(buildStaticFixture(), "25000");
    expect(d).toContain("010212");
    expect(d).not.toContain("010211");
  });
  it("embeds nominal tag 54", () => expect(toDynamic(buildStaticFixture(), "25000")).toContain("5405" + "25000"));
  it("preserves merchant name", () => expect(extractMerchantName(toDynamic(buildStaticFixture("WARUNG MIZ"), "99000"))).toBe("WARUNG MIZ"));
  it("output CRC valid for own body", () => {
    const d = toDynamic(buildStaticFixture(), "10000");
    const idx = d.lastIndexOf("6304");
    expect(d.slice(idx + 4)).toBe(crc16(d.slice(0, idx + 4)));
  });
  it("rejects non-numeric", () => expect(() => toDynamic(buildStaticFixture(), "abc")).toThrow());
  it("rejects zero/negative", () => {
    expect(() => toDynamic(buildStaticFixture(), "0")).toThrow();
    expect(() => toDynamic(buildStaticFixture(), "-500")).toThrow();
  });
  it("rejects invalid payload", () => expect(() => toDynamic("not a qris", "10000")).toThrow());
});

describe("isConfigured / generateDynamic", () => {
  it("false when env unset", () => {
    const prev = process.env.QRIS_STATIC_STRING;
    delete process.env.QRIS_STATIC_STRING;
    delete process.env.MIZ_QRIS_STATIC_STRING;
    try { expect(isConfigured()).toBe(false); } finally { if (prev !== undefined) process.env.QRIS_STATIC_STRING = prev; }
  });
  it("generateDynamic works when configured", () => {
    const prev = process.env.QRIS_STATIC_STRING;
    process.env.QRIS_STATIC_STRING = buildStaticFixture("WARUNG MIZ");
    try {
      const r = generateDynamic("149000");
      expect(r.merchantName).toBe("WARUNG MIZ");
      expect(r.qris).toContain("010212");
      expect(r.qris).toContain("149000");
    } finally { if (prev !== undefined) process.env.QRIS_STATIC_STRING = prev; else delete process.env.QRIS_STATIC_STRING; }
  });
  it("generateDynamic throws when not configured", () => {
    const prev = process.env.QRIS_STATIC_STRING;
    delete process.env.QRIS_STATIC_STRING;
    delete process.env.MIZ_QRIS_STATIC_STRING;
    try { expect(() => generateDynamic("10000")).toThrow(); } finally { if (prev !== undefined) process.env.QRIS_STATIC_STRING = prev; }
  });
});

describe("MDR fee", () => {
  it("default 0.7%", () => {
    const prev = process.env.QRIS_MDR_RATE;
    delete process.env.QRIS_MDR_RATE;
    try { expect(getMdrRate()).toBe(0.007); } finally { if (prev !== undefined) process.env.QRIS_MDR_RATE = prev; }
  });
  it("overridable via env", () => {
    const prev = process.env.QRIS_MDR_RATE;
    process.env.QRIS_MDR_RATE = "0.003";
    try { expect(getMdrRate()).toBe(0.003); } finally { if (prev !== undefined) process.env.QRIS_MDR_RATE = prev; else delete process.env.QRIS_MDR_RATE; }
  });
  it("calculateServiceFee total = base + fee", () => {
    const r = calculateServiceFee(149000);
    expect(r.baseAmount).toBe(149000);
    expect(r.serviceFee).toBe(Math.round(149000 * 0.007));
    expect(r.totalAmount).toBe(r.baseAmount + r.serviceFee);
  });
});
