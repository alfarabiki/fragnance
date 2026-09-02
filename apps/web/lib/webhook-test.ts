// Generate a Midtrans-style notification payload with a valid signature_key,
// ready to POST to /api/payments/webhook.  Useful for sandbox verification.
// SIGN stands for: SHA512(order_id + status_code + gross_amount + ServerKey)
import { createHash } from "crypto";

const serverKey = process.env.MIDTRANS_SERVER_KEY ?? "SB-Mid-server-test";

export function signedNotification(
  orderId: string,
  grossAmount: string,
  statusCode = "200",
  transactionStatus = "settlement",
) {
  const signature_key = createHash("sha512")
    .update(orderId + statusCode + grossAmount + serverKey)
    .digest("hex");

  return {
    order_id: orderId,
    status_code: statusCode,
    gross_amount: grossAmount,
    transaction_status: transactionStatus,
    payment_type: "qris",
    fraud_status: "accept",
    signature_key,
  };
}

export function verifySignedNotification(payload: {
  order_id: string;
  status_code: string;
  gross_amount: string;
  signature_key: string;
}): boolean {
  const expected = createHash("sha512")
    .update(payload.order_id + payload.status_code + payload.gross_amount + serverKey)
    .digest("hex");
  return payload.signature_key === expected;
}