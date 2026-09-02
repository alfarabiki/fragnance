import { createHash } from "crypto";

/**
 * Verify Midtrans webhook signature.
 * Expected = SHA512(order_id + status_code + gross_amount + serverKey)
 * This is a pure function so it can be unit-tested.
 */
export function verifyMidtransSignature(
  payload: Record<string, string | number>,
  serverKey: string,
): boolean {
  const orderId = String(payload.order_id ?? "");
  const statusCode = String(payload.status_code ?? "");
  const grossAmount = String(payload.gross_amount ?? "");
  const supplied = String(payload.signature_key ?? "");
  const expected = createHash("sha512")
    .update(orderId + statusCode + grossAmount + serverKey)
    .digest("hex");
  return supplied === expected;
}