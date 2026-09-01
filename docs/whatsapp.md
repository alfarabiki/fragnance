# WhatsApp Integration

## 1. Principle

**The website creates the order first. WhatsApp is a communication channel, not the source of truth.**

The database is the system of record. The order, customer details, address, product configuration, and price snapshot are all persisted **before** the WhatsApp deep link is opened. This guarantees:

- No order is lost if WhatsApp fails to open or the customer abandons the flow.
- Order data is complete and validated regardless of WhatsApp availability.
- The admin panel shows all orders, even those that never reached WhatsApp.

---

## 2. Architecture Flow

```
Customer fills order form
        │
        ▼
┌─────────────────────────────────────┐
│  Backend: Create Order              │
│  1. Generate order_id (ATL-YYMMDD-######)
│  2. Persist order row (PENDING)     │
│  3. Persist customer details        │
│  4. Persist address                 │
│  5. Persist product config snapshot │
│  6. Persist price snapshot          │
│  7. Initiate Midtrans QRIS payment  │
│  8. Return QR code + WhatsApp link  │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Frontend                           │
│  1. Display QR code for payment     │
│  2. Open WhatsApp deep link         │
│     (wa.me/628xxx?text=...)         │
└─────────────────────────────────────┘
```

The order is committed to the database **before** the browser opens WhatsApp. If the customer closes the tab, WhatsApp fails to open, or the deep link breaks — the order still exists and can be processed.

---

## 3. Deep Link Generation

The WhatsApp deep link uses the `wa.me` format with a URL-encoded message.

### Format

```
https://wa.me/{phone}?text={encoded_message}
```

### Phone Number

- Country code: `62` (Indonesia, no leading `0`).
- ATLASE WhatsApp number: `628XXXXXXXXXX` (stored as `WHATSAPP_PHONE_NUMBER` env var).
- The phone must **not** include `+`, spaces, or hyphens.

### URL Encoding

The message body is URL-encoded using `encodeURIComponent()` in JavaScript or equivalent in the server language. Every newline, space, and special character must be encoded.

**Example raw message (before encoding):**

```
Halo Atlase, saya ingin memesan:\n\nOrder:\n#ATL-260901-000128\n\nProduk:\nDior-inspired\n...
```

**After encoding:**

```
Halo%20Atlase%2C%20saya%20ingin%20memesan%3A%0A%0AOrder%3A%0A%23ATL-260901-000128%0A%0A...
```

### Complete Example

```
https://wa.me/6281234567890?text=Halo%20Atlase%2C%20saya%20ingin%20memesan%3A%0A%0AOrder%3A%0A%23ATL-260901-000128%0A%0AProduk%3A%0ADior-inspired%0A%0AUkuran%3A%0A50%20ml%0A%0AJumlah%20aroma%3A%0A20%20ml%0A%0AKekuatan%3A%0ASedang%0A%0ABotol%3A%0APremium%0A%0APackaging%3A%0AStandard%0A%0ATotal%3A%0ARp89.000%0A%0ANama%3A%0ABudi%20Santoso%0A%0ANo.%20WhatsApp%3A%0A%2B6281234567890%0A%0AAlamat%3A%0AJl.%20Sudirman%20No.%20123%2C%20RT01%2FRW02%0A%0AKecamatan%3A%0ATebet%0A%0AKota%2FKabupaten%3A%0AJakarta%20Selatan%0A%0AProvinsi%3A%0ADKI%20Jakarta%0A%0AKode%20Pos%3A%0A12190%0A%0AMohon%20dibantu%20proses%20pesanannya.
```

---

## 4. Message Template

The message is built **dynamically** from order data. It is never hardcoded.

### Encoder Function

```typescript
function buildWhatsAppMessage(order: OrderData): string {
  const fmt = (n: bigint): string => {
    return "Rp" + n.toLocaleString("id-ID");
  };

  const lines = [
    "Halo Atlase, saya ingin memesan:",
    "",
    "Order:",
    `#${order.orderNumber}`,
    "",
    "Produk:",
    order.productInspiration,
    "",
    "Ukuran:",
    order.bottleSize,
    "",
    "Jumlah aroma:",
    order.ariaVolume,
    "",
    "Kekuatan:",
    order.strength,
    "",
    "Botol:",
    order.bottleType,
    "",
    "Packaging:",
    order.packagingType,
    "",
    "Total:",
    fmt(order.totalAmount),
    "",
    "Nama:",
    order.customerName,
    "",
    "No. WhatsApp:",
    order.customerPhone,
    "",
    "Alamat:",
    order.fullAddress,
    "",
    "Kecamatan:",
    order.district,
    "",
    "Kota/Kabupaten:",
    order.city,
    "",
    "Provinsi:",
    order.province,
    "",
    "Kode Pos:",
    order.postalCode,
    "",
    "Mohon dibantu proses pesanannya.",
  ];

  return lines.join("\n");
}
```

### Worked Example

Given order data:

| Field | Value |
|---|---|
| Order Number | `ATL-260901-000128` |
| Product Inspiration | `Dior-inspired` |
| Bottle Size | `50 ml` |
| Aroma Volume | `20 ml` |
| Strength | `Sedang` |
| Bottle Type | `Premium` |
| Packaging | `Standard` |
| Total Amount | `89000` (bigint) |
| Customer Name | `Budi Santoso` |
| Phone | `+6281234567890` |
| Address | `Jl. Sudirman No. 123, RT01/RW02` |
| District | `Tebet` |
| City | `Jakarta Selatan` |
| Province | `DKI Jakarta` |
| Postal Code | `12190` |

The raw message produced by `buildWhatsAppMessage()`:

```
Halo Atlase, saya ingin memesan:

Order:
#ATL-260901-000128

Produk:
Dior-inspired

Ukuran:
50 ml

Jumlah aroma:
20 ml

Kekuatan:
Sedang

Botol:
Premium

Packaging:
Standard

Total:
Rp89.000

Nama:
Budi Santoso

No. WhatsApp:
+6281234567890

Alamat:
Jl. Sudirman No. 123, RT01/RW02

Kecamatan:
Tebet

Kota/Kabupaten:
Jakarta Selatan

Provinsi:
DKI Jakarta

Kode Pos:
12190

Mohon dibantu proses pesanannya.
```

This is then passed through `encodeURIComponent()` to produce the `?text=` parameter of the deep link.

---

## 5. Channel Attribution

When an order is created, a `whatsapp_orders` row is also inserted to track the WhatsApp communication channel.

### whatsapp_orders Table

| Column | Type | Description |
|---|---|---|
| `id` | UUID | Primary key |
| `order_id` | UUID FK | References the order |
| `status` | ENUM | `NOT_SENT`, `OPENED`, `CONFIRMED`, `PROCESSED` |
| `deep_link_url` | TEXT | The full wa.me URL (logged for debugging) |
| `raw_message` | TEXT | The message text before URL encoding |
| `created_at` | TIMESTAMP | When the order was created |
| `updated_at` | TIMESTAMP | Last status change |

### Status Lifecycle

```
NOT_SENT  →  OPENED  →  CONFIRMED  →  PROCESSED
```

- **NOT_SENT** — Order created, deep link generated but not yet opened by the customer.
- **OPENED** — Customer clicked the deep link (detected via redirect back or analytics).
- **CONFIRMED** — Admin confirmed the order via WhatsApp.
- **PROCESSED** — Order has been fulfilled/shipped.

---

## 6. Admin Workflow

1. Admin opens the admin panel and sees all orders with their WhatsApp status.
2. Admin reviews the order details and product configuration.
3. Admin contacts the customer via WhatsApp (using the pre-filled message as reference).
4. Admin confirms the order by updating the `whatsapp_orders.status` to `CONFIRMED`.
5. The order status is updated to `PROCESSING`.
6. After fulfillment, admin marks the order as `PROCESSED`.

The admin can also resend the WhatsApp link if the customer requests it (regenerate from the persisted order data).

---

## 7. WhatsApp Business API (Future — v2)

The current implementation uses `wa.me` deep links, which rely on the customer having WhatsApp installed. A future v2 integration can use the **WhatsApp Business API** for:

- Automated order confirmation messages.
- Status update notifications (order shipped, delivered).
- Two-way messaging within the ATLASE platform.

**v2 integration path:**

1. Register for the WhatsApp Business Platform.
2. Obtain a permanent phone number ID and access token.
3. Replace the deep link flow with Graph API calls:
   ```
   POST https://graph.facebook.com/v18.0/{phone_number_id}/messages
   ```
4. Add webhook receiver for inbound WhatsApp messages (for order confirmation replies).
5. Maintain the `whatsapp_orders` table with message IDs from the API for tracking delivery status.

The deep link approach remains as a fallback for customers who prefer to open WhatsApp directly.

---

## 8. Edge Cases

### WhatsApp Not Opened

If the customer does not click the deep link (closes the browser, declines the WhatsApp prompt, or does not have WhatsApp installed):

- The order **still exists** in the database with status `PENDING_PAYMENT` / `PENDING`.
- The `whatsapp_orders.status` remains `NOT_SENT`.
- The customer can return to the site and retry the WhatsApp link from the order confirmation page.
- The admin can manually contact the customer using the phone number from the order data.

### Retry Link

The order confirmation page always regenerates the WhatsApp deep link from the persisted order data (not from a cached value). The customer can click it again at any time before the order is confirmed.

### Character Encoding Issues

- The `encodeURIComponent()` function handles all special characters in the message (spaces, newlines, colons, slashes, `#`, `+`, etc.).
- If the encoded URL exceeds WhatsApp's URL length limit (~2000 characters), truncate the address field or use abbreviated labels. For typical Indonesian addresses, this limit is rarely reached.
- Test the encoded URL with the WhatsApp URL preview to verify the message renders correctly.

### Customer Changes Order After WhatsApp Sent

If the customer contacts ATLASE via WhatsApp with order changes (different size, address, etc.):

1. Admin updates the order in the admin panel.
2. A new price snapshot is saved.
3. A new WhatsApp deep link is generated with the updated data.
4. The admin sends the updated link to the customer, or the customer uses the site's "Update Order" feature.
