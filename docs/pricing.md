# ATLASE — Pricing (Commercial Model)

## 1. Core formula

```text
TOTAL = FRAGRANCE COST + ALCOHOL COST + BOTTLE + PACKAGING + ADD-ONS + SHIPPING − DISCOUNT
```

Concrete example (spec §15):

```text
Fragrance:  20 ml × Rp3.000   = 60.000
Alcohol:    30 ml × Rp300     =  9.000
Bottle:     Premium           = 15.000
Packaging:  Standard          =  5.000
─────────────────────────────────────
Subtotal                         89.000
Shipping                          0
Discount                          0
TOTAL                         Rp89.000
```

## 2. Cost vs selling

Every priceable unit carries both:

| Unit | Cost | Selling | Source |
|---|---|---|---|
| Fragrance | `cost_per_ml` | `price_per_ml` | `fragrance_pricing` |
| Alcohol | `alcohol_cost_per_ml` | `alcohol_price_per_ml` | `system_settings` (uniform) |
| Bottle | `cost_price` | `sell_price` | `bottles` |
| Packaging | `cost_price` | `sell_price` | `packaging` |
| Add-on | `cost_price` | `sell_price` | `add_ons` |

Gross margin per unit item: `(sell − cost) / sell`.

## 3. Formula invariants

- `volume_ml = fragrance_ml + alcohol_ml` (always).
- `fragrance_min_ml ≤ fragrance_ml ≤ fragrance_max_ml` per fragrance.
- Bottle `volume_ml` must hold `fragrance_ml + alcohol_ml` exactly. A bottle may have slack (fillable volume) but volume must not exceed bottle capacity. Bottle volume == selected volume preset.
- All prices are integer rupiah; every unit multiplication result rounds (see §6).
- Alcohol pricing is per-ml and identical across fragrances (configurable in settings).

## 4. Price versions

Configurations are versioned:

```text
pricing_versions:  DRAFT → PREVIEW → PUBLISHED → ACTIVE
```

- Only one `ACTIVE` version at a time.
- `fragrance_pricing` rows are tied to a version; changing a price creates a new row + version (no in-place overwrite of an ACTIVE record — ACTIVE rows are immutable; edits make a new version).
- Orders stamp `pricing_version_label` + full price snapshot.
- Admin UI shows diff between versions.

## 5. Discount & promotion (P1)

- Percent or fixed; min order; scope filters (fragrance/bottle/volume); date range; optional coupon.
- Applied server-side only, after subtotal, before shipping. Reflected in snapshot.

## 6. Shipping

- Abstraction for providers (JNE/J&T/SiCepat/ShopeeXpress) with `shipping_providers.shipping_services(slug, provider, service, cost, estimated_delivery)`.
- MVP: flat rate per region stored in `system_settings` with a `cost` and min-order free shipping threshold. Delivery estimate text shown at checkout.
- Shipping cost snapshotted on the order.

## 7. Rounding

- Integer arithmetic throughout. Rupiah has no subunit in practice; all operations use `Math.trunc` after exact integer math.
- Multiplication `(price * ml)` with integers never introduces float error. Divisions avoided; if a derived value needs division (e.g. margin %), compute in the reporting layer, never store.

## 8. Transparency

- The customer always sees the line-item breakdown at cart/checkout (Fragrance, Alcohol/volume, Bottle, Packaging, Shipping, Discount, Total) — no hidden fees.
- Markup policy: internal cost is never exposed to the frontend.