# ATLASE — API Contract

Versioned: `/api/v1` (storefront), `/api/v1/admin` (admin, RBAC-guarded). All money is **integer rupiah**. All responses JSON. Errors use a uniform shape (spec §67).

## 1. Response envelope (errors)

```json
{
  "error": {
    "code": "some_code",
    "message": "Pembayaran belum berhasil. Silakan coba lagi.",
    "details": null,
    "traceId": "abc123"
  }
}
```

Technical codes reserved for logs; the customer-facing `message` is always simple Bahasa Indonesia.

## 2. Public endpoints

### Catalog

| Method | Path | Notes |
|---|---|---|
| GET | `/products` | published products; filter `?category=&featured=` |
| GET | `/products/:slug` | product detail incl. fragrance |
| GET | `/fragrances` | active fragrances (id, slug, name, refLabel, minMl, maxMl, pricePerMl via active version) |
| GET | `/bottles` | active bottles with volume + price |
| GET | `/packaging` | active packaging options |
| GET | `/config` | site config: volumes presets [30,50,70,100], alcohol price, shipping base, FAQ, hero copy |

### Pricing & cart

| Method | Path | Notes |
|---|---|---|
| POST | `/pricing/quote` | authoritative quote; body = config; response `PriceQuote` (see pricing-engine.md) |
| POST | `/cart` | create cart item (validated config); store preview quote |
| PATCH | `/cart/:id` | update qty or customization; returns line price |
| GET | `/cart/:id` | cart contents with live re-quotes |
| DELETE | `/cart/:id` | remove item |

### Orders

| Method | Path | Notes |
|---|---|---|
| POST | `/orders` | create order; idempotency via `Idempotency-Key`; returns `{ orderNumber, orderId, channel, status, whatsappLink?, payment? }` |
| GET | `/orders/:id` | order lookup (by owner phone/session) |
| POST | `/orders/:id/whatsapp` | (re)generate WhatsApp deep link |
| POST | `/orders/:id/cancel` | cancel with reason |

### Payments

| Method | Path | Notes |
|---|---|---|
| POST | `/payments` | create Midtrans transaction for order (QRIS); server-side only |
| POST | `/payments/webhook/midtrans` | provider notification; verified server-side; idempotent |
| GET | `/payments/:id` | payment status (polled by frontend) |

### Customers

| Method | Path | Notes |
|---|---|---|
| POST | `/customers/verify-phone` | look up or create by phone (OTP optional, P1) |
| GET | `/customers/me` | profile (session) |
| PATCH | `/customers/me` | update profile/consent |

## 3. Admin endpoints (RBAC guards per permission code)

| Module | Methods (all under `/api/v1/admin`) |
|---|---|
| Fragrances | GET/POST `/fragrances`, GET/PATCH/DELETE `/fragrances/:id` |
| Pricing (fragrance) | GET/POST `/fragrances/:id/pricing`, POST `/fragrances/:id/pricing/activate` |
| Bottles | GET/POST `/bottles`, PATCH `/bottles/:id` |
| Packaging | GET/POST `/packaging`, PATCH `/packaging/:id` |
| Pricing rules | GET/POST `/pricing-rules`, PATCH `/pricing-rules/:id` |
| Pricing versions | GET `/pricing-versions`, POST `/pricing-versions/:id/publish` |
| Price simulator | POST `/simulator/quote` (uses same engine + hypothetical prices) |
| Orders | GET `/orders`, GET `/orders/:id`, PATCH `/orders/:id/status` (validated transition), PATCH `/orders/:id/confirm` |
| Customers | GET `/customers`, GET `/customers/:id` |
| Payments | GET `/payments`, GET `/payments/:id` |
| WhatsApp | GET `/whatsapp-orders`, PATCH `/whatsapp-orders/:id` |
| Promotions | GET/POST `/promotions`, PATCH `/promotions/:id` |
| Inventory | GET `/inventory`, POST `/inventory/adjust` |
| Analytics | GET `/analytics/summary`, GET `/analytics/orders`, GET `/analytics/funnel` |
| Audit | GET `/audit-logs` |
| Users & roles | GET/POST `/users`, POST `/roles`, PUT `/users/:id/roles` |
| Settings | GET/PATCH `/settings` |

## 4. Order creation request (example)

```json
POST /api/v1/orders
Idempotency-Key: 550e8400-e29b-41d4-a716-446655440000

{
  "channel": "WHATSAPP" | "DIRECT_PAYMENT",
  "customer": {
    "name": "Budi",
    "phone": "081234567890",
    "email": null
  },
  "address": {
    "recipientName": "Budi",
    "phone": "081234567890",
    "province": "DKI Jakarta",
    "city": "Jakarta Selatan",
    "district": "Kebayoran Baru",
    "subdistrict": "Selong",
    "postalCode": "12110",
    "fullAddress": "Jl. Wolter Monginsidi No. 21",
    "note": "Jam kerja, kirim sore."
  },
  "items": [
    {
      "fragranceId": "…",
      "volumeMl": 50,
      "fragranceMl": 20,
      "bottleId": "…",
      "packagingId": "…",
      "quantity": 1
    }
  ]
}
```

**Server ignores any client-supplied price.** Server re-quotes via engine, and (in release builds) compares against preview for tamper detection → logs audit warning.

## 5. Response — order created (WHATSAPP channel)

```json
{
  "orderNumber": "ATL-260901-000128",
  "orderId": "…",
  "status": "DRAFT",
  "channel": "WHATSAPP",
  "totals": { "subtotal": 80000, "discount": 0, "shipping": 0, "total": 80000 },
  "whatsappLink": "https://wa.me/6281234567890?text=…",
  "expiresAt": null
}
```

## 6. Quote request/response

```json
POST /api/v1/pricing/quote
{
  "fragranceId": "…", "volumeMl": 50, "fragranceMl": 20,
  "bottleId": "…", "packagingId": "…"
}
```

```json
{
  "subtotal": 80000, "shipping": 0, "discount": 0, "total": 80000,
  "currency": "IDR", "pricingVersionLabel": "v1.4",
  "lineItems": { "fragrance": { "label": "Dior-inspired", "unitPrice": 3000, "quantityMl": 20, "amount": 60000 }, "alcohol": { "label": "Alkohol", "unitPrice": 300, "quantityMl": 30, "amount": 9000 }, "bottle": { "label": "Premium", "amount": 15000 }, "packaging": { "label": "Standard", "amount": 5000 }, "addons": [] }
}
```

## 7. Rate limiting & auth

- Public GETs: token-bucket (Redis), generous.
- Order/payment creation: strict per-IP + per-phone.
- Admin: Supabase session + RBAC; all mutations audit-logged.
- Webhook: signature verification (HMAC) — see midtrans.md.