import { describe, it, expect } from "vitest";
import {
  signedNotification,
  verifySignedNotification,
} from "./webhook-test";

describe("webhook signed notification (Midtrans sandbox)", () => {
  it("generates a payload that verifies (genuine)", () => {
    const payload = signedNotification("ATL-260902-000001", "85000.00");
    expect(verifySignedNotification(payload)).toBe(true);
  });

  it("fails verification if amount is tampered", () => {
    const payload = signedNotification("ATL-260902-000001", "85000.00");
    const tampered = { ...payload, gross_amount: "1.00" };
    expect(verifySignedNotification(tampered)).toBe(false);
  });

  it("fails verification if order id is swapped", () => {
    const payload = signedNotification("ATL-260902-000001", "85000.00");
    const swapped = { ...payload, order_id: "ATL-260902-999999" };
    expect(verifySignedNotification(swapped)).toBe(false);
  });
});