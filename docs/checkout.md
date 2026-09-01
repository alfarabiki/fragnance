# Checkout Flow — ATLASE

## 1. Cart

### Layout

- **Desktop**: CartDrawer opens as a right-side panel, overlaying the main content.
- **Mobile**: CartDrawer opens as a bottom sheet.

### Cart Contents

Each cart item displays:

| Field | Description |
|-------|-------------|
| Product | Fragrance name(s) and selected bottle |
| Customization Summary | Volume, strength, fragrance breakdown, packaging |
| Quantity | Editable (increment/decrement) |
| Price | Line total in integer rupiah |

### Edit Customization

- The customer can tap "Edit" on any cart item to re-enter the full 7-step customization flow.
- All previous selections are pre-filled.
- Exiting the edit flow saves changes back to the same cart item — no duplicate is created.
- The customer never loses the item or its position in the cart.

## 2. Customer Data Collection

Checkout collects minimal customer information:

| Field | Required | Notes |
|-------|----------|-------|
| Nama | Yes | Customer's full name |
| Nomor WhatsApp | Yes | Must be a valid WhatsApp number (country code included). Used for order communication and deep link. |
| Email | No | Optional. Used for order confirmation if provided. |

Customer data is validated client-side before proceeding to the address step.

## 3. Address Form

| Field | Required | Notes |
|-------|----------|-------|
| Nama | Yes | Recipient name (may differ from customer name) |
| Nomor WhatsApp | Yes | Contact number for delivery |
| Email | No | Optional |
| Provinsi | Yes | Province — dropdown populated from server |
| Kota/Kabupaten | Yes | City/Regency — cascading dropdown, depends on Provinsi |
| Kecamatan | Yes | District — cascading dropdown, depends on Kota/Kabupaten |
| Kelurahan | Yes | Sub-district — cascading dropdown, depends on Kecamatan |
| Kode Pos | Yes | Postal code — validated against Kelurahan |
| Alamat Lengkap | Yes | Full street address (free text, multiline) |
| Catatan | No | Delivery notes (e.g., "Rumah cat biru, sebelah Indomaret") |

Cascading dropdowns load options from the server as the parent selection changes. Invalid combinations are rejected server-side during order creation.

## 4. Order Creation

### Server-Side Process

1. **Idempotency key**: The frontend generates a UUID idempotency key and attaches it to the create-order request. The server uses this key to prevent duplicate order creation on retry.
2. **Authoritative re-quote**: The server recomputes the price using the canonical pricing engine against the submitted customization payload. If the total differs from the client-submitted amount, the server's value is used.
3. **Snapshot**: The full customization, pricing breakdown, customer data, and address are snapshotted into the order record. This snapshot is immutable.
4. **Order state**: New orders start in state `PENDING_PAYMENT`.

### Pricing Integrity

- All money values are **integer rupiah** — no floating point, no decimal rounding ambiguity.
- The server never trusts the client-submitted total.

## 5. WhatsApp Path

### Flow

1. Customer selects **WhatsApp** as the payment/ordering method.
2. The server generates a WhatsApp deep link containing the order summary:
   ```
   https://wa.me/{phone}?text={encoded_order_summary}
   ```
3. The browser redirects to WhatsApp (or WhatsApp Web).
4. The customer completes payment/confirmation via WhatsApp chat.
5. On return to ATLASE, the order confirmation screen is displayed.

### Success State

- Order is confirmed when the WhatsApp message is sent.
- The order remains in `PENDING_PAYMENT` until manual or webhook confirmation from the admin/ops side.

## 6. QRIS Path

### Flow

1. Customer selects **QRIS** as the payment method.
2. The server creates a Midtrans transaction via the Midtrans API.
3. Midtrans returns a QR code URL / payload.
4. The frontend displays the QR code for the customer to scan with their banking/e-wallet app.
5. The frontend **polls** the Midtrans transaction status at regular intervals.

### Payment Status Polling

| Status | Behavior |
|--------|----------|
| `pending` | Continue polling. Show countdown or spinner. |
| `settlement` / `capture` | Payment successful. Transition to order confirmation. |
| `expire` | QR expired. Offer to regenerate a new QR. |
| `deny` / `cancel` | Payment failed. Show error, offer retry. |

### Midtrans Webhook

- Midtrans sends a server-to-server notification (webhook) on status change.
- The webhook handler verifies the signature, updates the order state, and is idempotent (replays of the same notification are safe).

## 7. Order Confirmation Screen

After successful payment (QRIS settled or WhatsApp confirmed):

| Element | Content |
|---------|---------|
| Order number | Unique order ID |
| Status | Current order state |
| Customization summary | Full snapshot of the perfume configuration |
| Total paid | Integer rupiah amount |
| Payment method | WhatsApp or QRIS |
| Estimated processing | "Pesananmu sedang diproses" or similar |
| Next steps | Instructions for follow-up (WhatsApp contact, tracking, etc.) |

## 8. Failure States

All error messages use simple, friendly Indonesian.

| Condition | User Message | Recovery |
|-----------|-------------|----------|
| Payment expired (QRIS) | "QRIS sudah kedaluwarsa. Mau buat baru?" | Regenerate QR |
| Payment denied/cancelled | "Pembayaran gagal. Coba bayar lagi atau pilih metode lain." | Retry or switch method |
| Network error during payment | "Koneksi terputus. Cek status pesananmu di WhatsApp ya." | Retry or check via WhatsApp |
| Order creation failed | "Gagal membuat pesanan. Coba lagi dari keranjang." | Return to cart |
| Invalid address | "Alamat tidak lengkap. Lengkapi semua kolom yang wajib diisi." | Fix address fields |
| Price mismatch (re-quote) | "Harga baru saja berubah. Harga terbaru sudah ditampilkan." | Auto-update displayed price |
| WhatsApp deep link failed | "Tidak bisa membuka WhatsApp. Salin pesan dan kirim manual." | Show raw text to copy |

## 9. Browser Closed / Resumability

### QRIS Path

- If the customer closes the browser during QRIS payment, the Midtrans transaction continues server-side.
- When the customer returns, they can check their order status.
- If the QR expired, a new QR can be generated for the same order.

### WhatsApp Path

- If the browser closes after the WhatsApp deep link is generated, the order is already created.
- The customer continues the flow in WhatsApp.
- Returning to ATLASE shows the order confirmation based on order ID.

### Session Recovery

- Cart contents are persisted server-side (tied to session or authenticated user).
- If the customer returns with an active session, their cart is restored.
- Orders in `PENDING_PAYMENT` are visible in the customer's order history (if authenticated) or retrievable via WhatsApp reference.
