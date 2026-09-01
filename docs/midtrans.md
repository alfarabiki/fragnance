# Midtrans Integration

## 1. Credentials & Modes

Midtrans operates in two environments. Both use the **same SDK/API shape**; only the base URL and credentials differ.

| Property | Sandbox | Production |
|---|---|---|
| Snap API Base | `https://app.sandbox.midtrans.com/snap` | `https://app.midtrans.com/snap` |
| API Base | `https://api.sandbox.midtrans.com/v2` | `https://api.midtrans.com/v2` |
| Server Key | `SB-Mid-server-XXXXXXXXXXXXXXXXXX` | `Mid-server-XXXXXXXXXXXXXXXXXX` |
| Client Key | `SB-Mid-client-XXXXXXXXXXXXXXXXXX` | `Mid-client-XXXXXXXXXXXXXXXXXX` (if needed) |
| Merchant ID | From dashboard | From dashboard |

**Critical rules:**

- **Server key** is stored **only** on the backend. It is never exposed to the frontend, bundled in client JS, or committed to version control.
- The active environment is selected via environment variables `MIDTRANS_SANDBOX` / `MIDTRANS_PRODUCTION`. A boolean flag `MIDTRANS_IS_PRODUCTION` determines which base URL and key to use.
- At **no point** is the server key available to the browser, mobile app, or any other client-side context.

---

## 2. API Usage — Snap Create Transaction

The primary integration point is the **Snap API** `POST /snap/v1/transactions` endpoint.

### Request Fields

```json
{
  "transaction_details": {
    "order_id": "ATL-260901-000128",
    "gross_amount": 89000
  },
  "item_details": [
    {
      "id": "item-001",
      "price": 89000,
      "quantity": 1,
      "name": "Dior-inspired 50ml"
    }
  ],
  "customer_details": {
    "first_name": "Budi",
    "last_name": "Santoso",
    "email": "budi@example.com",
    "phone": "+6281234567890",
    "billing_address": {
      "address": "Jl. Sudirman No. 123",
      "city": "Jakarta Selatan",
      "postal_code": "12190",
      "country": "IDN"
    },
    "shipping_address": {
      "address": "Jl. Sudirman No. 123",
      "city": "Jakarta Selatan",
      "postal_code": "12190",
      "country": "IDN"
    }
  },
  "payment_type": "qris",
  "expiry": {
    "unit": "hour",
    "duration": 1
  },
  "callbacks": {
    "finish": "https://atlase.id/order/status?order_id=ATL-260901-000128"
  }
}
```

### field约束

- `transaction_details.order_id` — Must be **unique per merchant**. Only alphanumeric, hyphens, and underscores are allowed (`[A-Za-z0-9_-]`). The ATLASE format `ATL-YYMMDD-######` satisfies this constraint.
- `transaction_details.gross_amount` — Integer rupiah. Must match the sum of `item_details[].price * item_details[].quantity`.
- `item_details` — Each item has `id`, `price` (per-unit, integer), `quantity`, and `name`.
- `customer_details` — Name, email, phone. Addresses are optional but recommended.
- `expiry` — Unit is `"hour"` or `"minute"`. Duration is a positive integer. Default varies by payment type; ATLASE sets 1 hour for QRIS.

### Response Fields

```json
{
  "token": "snap-token-xxxxx",
  "redirect_url": "https://app.sandbox.midtrans.com/snap/v1/redirect/snap-token-xxxxx",
  "qris": {
    "qr_code_url": "https://....png"
  }
}
```

- `redirect_url` — Used as a fallback (Snap page with QR displayed).
- `qris.qr_code_url` — The QR code image URL, displayed directly to the customer.

---

## 3. QRIS Specifics

QRIS (Quick Response Indonesian Standard) is the primary payment method.

- `payment_type: "qris"` in the create transaction request.
- The response includes a `qr_code_url` containing the QRIS QR code image.
- The QR code encodes a `qr_code` string that the customer scans with any QRIS-compatible app (GoPay, OVO, DANA, ShopeePay, LinkAja, bank apps).
- QRIS transactions expire after the configured `expiry` duration. If unpaid, the transaction is automatically marked `expire` by Midtrans.
- The customer's bank/e-wallet app processes the QRIS scan; Midtrans handles settlement.

---

## 4. Webhook (Notification)

Midtrans sends a POST request to the configured `notification_url` whenever a transaction status changes.

### Notification Payload

```json
{
  "transaction_time": "2026-09-01 10:30:15",
  "transaction_status": "capture",
  "transaction_id": "midtrans-txn-xxxxx",
  "status_message": "midtrans payment notification",
  "status_code": "200",
  "signature_key": "SHA512-hash-string",
  "settlement_time": "2026-09-01 10:31:00",
  "payment_type": "qris",
  "order_id": "ATL-260901-000128",
  "merchant_id": "G000000000",
  "gross_amount": "89000.00",
  "fraud_status": "accept"
}
```

### Signature Verification

The `signature_key` field must be verified by the backend before processing.

**Computation:**

```
SHA-512(order_id + status_code + gross_amount + server_key)
```

- Concatenate the values as **strings** with no separator.
- `order_id` — from the payload.
- `status_code` — from the payload (the HTTP status code Midtrans used, e.g. `"200"`).
- `gross_amount` — from the payload, as the decimal string (e.g. `"89000.00"`).
- `server_key` — the active environment's Midtrans server key.
- Compute HMAC SHA-512 of the concatenated string.
- Compare against `signature_key` in the payload (constant-time comparison).

If verification fails → return HTTP 400, log the mismatch, do not process.

### Idempotency via Request ID

- Midtrans includes a `request_id` header or field in retries.
- Use this as a deduplication key alongside `order_id + transaction_status` to prevent duplicate processing of the same notification.

### Status Code Mapping

| `status_code` | `transaction_status` | Meaning | Internal Action |
|---|---|---|---|
| `200` | `capture` | Payment captured | Mark order `CONFIRMED` |
| `200` | `settlement` | Payment settled (final) | Mark order `COMPLETED` |
| `200` | `refund` | Refund processed | Mark order `REFUNDED` |
| `201` | `pending` | Awaiting payment | No action (already `PENDING_PAYMENT`) |
| `202` | `deny` | Payment denied | Mark order `FAILED` |
| `202` | `cancel` | Transaction cancelled | Mark order `CANCELLED` |
| `202` | `expire` | Transaction expired | Mark order `EXPIRED` |

Only `200` status codes trigger a positive state transition. Status codes `201` and `202` are informational or terminal negative.

### Notification URL Configuration

The `notification_url` is set in the Midtrans dashboard and must point to the backend's webhook endpoint:

```
https://atlase.id/api/midtrans/webhook
```

The URL must be HTTPS and publicly reachable. Midtrans will retry failed deliveries with exponential backoff.

---

## 5. Snap Redirect for Fallback

If the QR code cannot be displayed (e.g., client-side rendering issue), the customer is redirected to the Snap page via `redirect_url`. The Snap page shows the same QR code and allows payment through the browser.

The `callbacks.finish` URL in the Snap configuration redirects the customer back to ATLASE after payment (success or failure). This is **informational only** — the backend relies on the webhook for actual status confirmation.

---

## 6. Sandbox Testing

### Test Configuration

Set `MIDTRANS_IS_PRODUCTION=false` and use sandbox credentials. The sandbox environment simulates payment flows without real money.

### QRIS Simulation

In sandbox, Midtrans does not generate real QR codes for QRIS. Instead:

- Use the sandbox simulator at the Midtrans dashboard to manually trigger `capture` / `settlement` / `deny` / `expire` webhooks.
- Alternatively, call the Midtrans sandbox API directly to simulate a notification:
  ```
  POST https://app.sandbox.midtrans.com/v2/{order_id}/status
  ```
  With the appropriate status change payload.

### Test Data

| Field | Sandbox Value |
|---|---|
| Order ID | `ATL-TEST-000001` |
| Amount | `10000` |
| Transaction Status | Manually set via simulator |

### Webhook URL for Sandbox

Webhooks are delivered to the same `notification_url`. Ensure your sandbox environment is publicly reachable (use ngrok, cloudflare tunnel, or deploy sandbox to a staging server).

---

## 7. Error Codes

| HTTP Status | Midtrans Error | Description | Action |
|---|---|---|---|
| `400` | `400` | Bad request — invalid parameter | Check request fields |
| `401` | `401` | Unauthorized — invalid server key | Verify server key |
| `402` | `402` | Transaction not found | Verify order_id |
| `403` | `403` | Forbidden — merchant not active | Contact Midtrans support |
| `404` | `404` | Transaction not found | Order may not have been created |
| `406` | `406` | Duplicate order_id — already exists | Use unique order_id |
| `410` | `410` | Transaction already expired | Customer must pay again |
| `412` | `412` | Transaction denied by fraud | Review fraud_status |
| `500` | `500` | Internal server error (Midtrans) | Retry with exponential backoff |
| `503` | `503` | Midtrans service unavailable | Retry with backoff, max 3 attempts |

**Duplicate order_id (406):** This means an order with this `order_id` already exists at Midtrans. On retry, the backend should check for an existing Midtrans transaction for this order and reuse it rather than creating a new one.

---

## 8. Logging & Observability

Every payment interaction is logged for debugging and audit.

### Events Logged

| Event | Log Level | Details |
|---|---|---|
| Transaction created | INFO | order_id, provider_txn_id, amount |
| Transaction creation failed | ERROR | order_id, error message, HTTP status |
| Webhook received | INFO | order_id, transaction_status, status_code |
| Signature verification failed | WARN | order_id, received signature, computed signature |
| Signature verification passed | DEBUG | order_id |
| Order status transitioned | INFO | order_id, old_status → new_status |
| Duplicate notification ignored | DEBUG | order_id, event_type, existing event_id |
| Refund initiated | INFO | order_id, provider_txn_id, amount |
| Reconciliation discrepancy | WARN | order_id, local_status, remote_status |

### Metrics

- `payment_transactions_created_total` — counter by status.
- `payment_webhook_received_total` — counter by status_code.
- `payment_signature_verification_failed_total` — counter (alerting threshold).
- `payment_reconciliation_discrepancies_total` — counter.

### Structured Logging

All payment logs use structured JSON with fields: `service`, `event`, `order_id`, `provider_transaction_id`, `amount`, `status`, `timestamp`. This enables querying in log aggregation systems.
