# Payment System

## 1. Payment Abstraction

```typescript
interface PaymentProvider {
  createTransaction(order: Order, config: PaymentConfig): Promise<PaymentTransaction>;
  verifyWebhook(payload: unknown, headers: Record<string, string>): Promise<WebhookResult>;
  getStatus(providerTransactionId: string): Promise<PaymentStatus>;
  refund(providerTransactionId: string, amount: bigint): Promise<RefundResult>;
}
```

All monetary values are **integer rupiah** (`bigint` in application code, `BIGINT` in the database). Never use floating point. `90000` means Rp90.000.

The provider implementation (`MidtransProvider`) is the only module that imports Midtrans SDK credentials. All other modules interact through this interface.

---

## 2. Transaction Creation (Server-Side)

Orders are **always created server-side**. The frontend never directly contacts the payment provider.

**Sequence:**

1. Customer submits order form.
2. Backend validates inputs, generates order number (`ATL-YYMMDD-######`), persists order row with status `PENDING_PAYMENT`.
3. Backend calls `PaymentProvider.createTransaction()`, passing the order and payment configuration.
4. Backend persists the provider transaction ID and QR code data on the order/payment record.
5. Frontend receives the QR code image (base64 or URL) and displays it.

Order creation and payment transaction creation are **separate operations**. The order must be committed to the database before the payment transaction is initiated. If payment transaction creation fails, the order remains in `PENDING_PAYMENT` and can be retried.

---

## 3. QRIS Flow

### 3.1 Create

When the order is ready, the backend requests a QRIS transaction from Midtrans:

```
POST /snap/v1/transactions
{
  transaction_details: { order_id: "ATL-260901-000128", gross_amount: 89000 },
  item_details: [...],
  customer_details: { ... },
  payment_type: "qris",
  expiry: { unit: "hour", duration: 1 }
}
```

Response contains:
- `redirect_url` — Snap page URL (fallback).
- QR code data — rendered as an image for the customer.

### 3.2 Display

The frontend displays the QR code. A **countdown timer** is derived from the expiry set during transaction creation (default: 1 hour). The customer scans the QRIS code with their banking/e-wallet app.

### 3.3 Poll (Fallback Only)

QRIS relies on **webhooks** as the primary confirmation mechanism. Polling (`GET /transactions/{order_id}/status`) is a fallback used only:

- When the webhook is delayed beyond a configurable threshold (e.g., 30 seconds after payment).
- When the customer returns to the site and clicks "Check Payment Status."
- For reconciliation jobs (see §6).

The backend **never trusts** the frontend's claim of payment status.

---

## 4. Webhook Processing

The webhook (`notification_url`) receives a POST from Midtrans. This is the **authoritative source** of payment confirmation.

### Processing Pipeline

```
1. RECEIVE      — Midtrans POSTs to notification_url
2. VERIFY SIG   — Validate HMAC SHA-512 signature
3. IDENTIFY     — Look up order by order_id from payload
4. VERIFY ORDER — Confirm order exists, status is PENDING_PAYMENT
5. VERIFY AMT   — Confirm gross_amount matches order total
6. UPDATE PAY   — Record provider status on payment record
7. UPDATE ORDER — Transition order status (e.g. → CONFIRMED/PROCESSING)
8. CREATE EVENT — Insert into payment_events table
9. IDEMPOTENT   — Skip if this notification was already processed
```

### Signature Verification

Midtrans sends a `signature_key` in the notification body. The backend recomputes the signature:

```
SHA-512(order_id + status_code + gross_amount + server_key)
```

- `order_id` — from the notification payload.
- `status_code` — HTTP status code Midtrans associates (200 for success).
- `gross_amount` — the transaction amount as a string.
- `server_key` — the Midtrans server key (environment-specific).

If the computed signature does not match the received `signature_key`, the webhook is **rejected** (HTTP 400). An audit event is logged for signature mismatches.

### Status Code Mapping

| Midtrans `transaction_status` | Midtrans `status_code` | Internal Order Status |
|---|---|---|
| `capture` | `200` | `CONFIRMED` |
| `settlement` | `200` | `COMPLETED` |
| `pending` | `201` | `PENDING_PAYMENT` |
| `deny` | `202` | `FAILED` |
| `cancel` | `202` | `CANCELLED` |
| `expire` | `202` | `EXPIRED` |
| `refund` | `200` | `REFUNDED` |

---

## 5. Idempotency

Every state transition must be idempotent. Duplicate webhooks must not create duplicate order status changes or duplicate `payment_events` rows.

**Mechanism:**

- `payment_events` table has a unique constraint on `(order_id, event_type, provider_transaction_id)`.
- Before inserting a new event, the system checks for an existing row with the same composite key.
- If a row exists, the current notification is silently acknowledged (HTTP 200) without mutation.
- Order status transitions are guarded: only transition if the current status is a valid predecessor.

**Order creation** and **payment transaction creation** also use idempotency keys derived from the order number to prevent duplicate charges on retry.

---

## 6. Reconciliation

A **daily reconciliation job** compares Midtrans transaction status against local order/payment status.

**Process:**

1. Query all orders in `PENDING_PAYMENT` status created in the last 24–72 hours.
2. For each, call Midtrans `GET /v1/{order_id}/status` (or use batch endpoint).
3. Compare the provider's `transaction_status` against the local order status.
4. Discrepancies are flagged in a `reconciliation_discrepancies` table.
5. Automatic correction is **not** applied; discrepancies are reviewed manually by an admin.

**Rationale:** Automatic correction is avoided because the discrepancy may be intentional (e.g., manual admin override) or may indicate fraud.

---

## 7. Failure Handling

### PENDING_PAYMENT Timeout

If an order remains in `PENDING_PAYMENT` beyond the expiry window (configured per payment method, default 1 hour), the system transitions it to `EXPIRED`. This is handled by a scheduled job that runs every 5 minutes.

### EXPIRED Orders

Expired orders are **not automatically retried**. The customer must place a new order. This avoids duplicate charges and ambiguous state.

### Webhook Delivery Failure

If the webhook endpoint returns a non-2xx status, Midtrans will retry. The backend handles retries idempotently (see §5). If all retries are exhausted, the admin is notified via monitoring/alerting.

### Network Timeout on Transaction Creation

If the backend's call to Midtrans to create a transaction times out:
1. The order remains in `PENDING_PAYMENT`.
2. The customer is shown a "Payment Pending" page with a retry button.
3. On retry, the backend checks if a Midtrans transaction already exists for this order. If yes, it reuses the existing QR code. If no, it creates a new transaction.

---

## 8. Refund Flow

Refunds are initiated from the admin panel and processed through Midtrans's refund API.

1. Admin selects a completed order and requests a refund (full or partial).
2. Backend calls `PaymentProvider.refund()` with the provider transaction ID and amount.
3. Midtrans processes the refund and sends a webhook with `transaction_status: "refund"`.
4. Backend verifies the refund webhook, updates the order status to `REFUNDED`, and creates a `payment_events` row of type `REFUND`.

Partial refunds are supported. The order status transitions to `PARTIALLY_REFUNDED` if only a portion of the gross amount is returned.

---

## 9. Payment Audit Trail

Every payment-related state change is recorded in the `payment_events` table.

| Column | Description |
|---|---|
| `id` | UUID primary key |
| `order_id` | FK to orders |
| `provider_transaction_id` | Midtrans transaction identifier |
| `event_type` | `CREATED`, `PENDING`, `SUCCESS`, `FAILURE`, `EXPIRY`, `REFUND`, `NOTIFICATION` |
| `raw_payload` | Full JSON body received from Midtrans (for webhook events) or generated internally |
| `verified` | `true` if the event passed signature verification; `false` if generated internally |
| `created_at` | Timestamp |

**Querying:** Admins can view the full event history for any order to trace its lifecycle from creation through payment to fulfillment or refund.

**Retention:** Payment events are retained for the lifetime of the order. No automatic purging.
