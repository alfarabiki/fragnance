import { describe, it, expect } from "vitest";
import { createHash } from "crypto";
import { verifyMidtransSignature } from "./midtrans";

function computeSignature(orderId: string, statusCode: string, gross: string, serverKey: string): string {
  return createHash("sha512").update(orderId + statusCode + gross + serverKey).digest("hex");
}

describe("verifyMidtransSignature", () => {
  const serverKey = "SB-Mid-server-test-key-123";

  it("accepts a genuine signature", () => {
    const sig = computeSignature("ATL-260902-000001", "200", "85000.00", serverKey);
    const ok = verifyMidtransSignature(
      { order_id: "ATL-260902-000001", status_code: "200", gross_amount: "85000.00", signature_key: sig },
      serverKey,
    );
    expect(ok).toBe(true);
  });

  it("rejects a signature computed with a different key", () => {
    const evil = computeSignature("ATL-260902-000001", "200", "85000.00", "attacker-key");
    const ok = verifyMidtransSignature(
      { order_id: "ATL-260902-000001", status_code: "200", gross_amount: "85000.00", signature_key: evil },
      serverKey,
    );
    expect(ok).toBe(false);
  });

  it("rejects a tampered amount", () => {
    const sig = computeSignature("ATL-260902-000001", "200", "85000.00", serverKey);
    const ok = verifyMidtransSignature(
      { order_id: "ATL-260902-000001", status_code: "200", gross_amount: "1.00", signature_key: sig },
      serverKey,
    );
    expect(ok).toBe(false);
  });
});