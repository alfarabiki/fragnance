# ATLASE — Pricing Engine Specification

The pricing engine is the **only** authority for a final price. It lives in `packages/pricing` (`@pkg/pricing`), is pure (no I/O), deterministic, and unit-tested.

## 1. Input

```ts
type PricingConfig = {
  fragrance: { id: string; pricePerMl: number };   // integers (rupiah)
  alcohol:   { pricePerMl: number };
  volumeMl: number;
  fragranceMl: number;
  bottle:    { id: string; price: number; volumeMl: number };
  packaging: { id: string; price: number; mandatory: boolean };
  addons?:   Array<{ id: string; price: number }>;
};

type QuoteContext = {
  pricingVersionLabel: string;
  shipping: number;                 // from shipping service
  discounts: Discount[];            // validated promotions
  currency: 'IDR';
};
```

## 2. Validation (fail-fast, structured errors)

- `volumeMl` in allowed volume set (or compatible bottle capacity).
- `fragranceMl + alcoholMl === volumeMl`.
- `fragrance.minMl ≤ fragranceMl ≤ fragrance.maxMl`.
- Bottle exists / active; `bottle.volumeMl === volumeMl`.
- Packaging exists / active; if mandatory must be present.
- Add-ons exist / active.
- Discounts valid for combo; coupon code matches.

## 3. Calculation steps (order fixed)

```ts
1. validateConfiguration(cfg) → asserts
2. fragrance = fragranceMl * fragrance.pricePerMl
3. alcohol   = alcoholMl * alcohol.pricePerMl      // alcoholMl = volumeMl − fragranceMl
4. bottle    = bottle.price
5. packaging = packaging.price
6. addons    = Σ addon.price
7. subtotal  = fragrance + alcohol + bottle + packaging + addons
8. discount  = applyDiscounts(subtotal, discounts)
9. shipping  = selectShipping(...)
10. total     = subtotal − discount + shipping
```

## 4. Output

```ts
type PriceQuote = {
  lineItems: {
    fragrance: { label: string; unitPrice: number; quantityMl: number; amount: number };
    alcohol:   { label: string; unitPrice: number; quantityMl: number; amount: number };
    bottle:    { label: string; amount: number };
    packaging: { label: string; amount: number };
    addons:    Array<{ label: string; amount: number }>;
  };
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  currency: 'IDR';
  pricingVersionLabel: string;
};
```

## 5. Deterministic test cases (`packages/pricing/__tests__`)

Canonical example from spec §107:

```ts
fragrance = 3000/ml, fragranceMl=20 → 60.000
alcohol   =  300/ml, alcoholMl=30   →  9.000
bottle    = Premium                  → 15.000
packaging = Standard                 →  5.000
TOTAL     = 89.000
```

Full matrix:

| Case | Expected |
|---|---|
| Minimum fragrance ml (= 5) | computes, valid |
| Maximum fragrance ml (= 50) | computes, valid |
| fragranceMl > max | throws `FRAGRANCE_OVER_MAX` |
| fragranceMl < min | throws `FRAGRANCE_UNDER_MIN` |
| zero fragranceMl | throws `FRAGRANCE_UNDER_MIN` |
| volumeMl not matching bottle capacity | throws `BOTTLE_VOLUME_MISMATCH` |
| inactive bottle id | throws `BOTTLE_UNAVAILABLE` |
| inactive fragrance id | throws `FRAGRANCE_UNAVAILABLE` |
| mandatory packaging missing | throws `MANDATORY_PACKAGING_REQUIRED` |
| volume ≠ fragrance+alcohol | throws `VOLUME_INCONSISTENT` |
| decimal inputs | cast/truncate per money rule; test truncation |
| price version change mid-quote | engine is stateless; caller snapshots version id at request start |
| discount percent (10%) | `subtotal − round(subtotal×0.10)` via integer math |
| discount fixed (Rp5.000) | exact |
| discount > subtotal | capped → discount = subtotal |
| shipping added | added after discount |
| rounding (odd multiplication) | `trunc` integer, no float drift |

Engine is a pure function `calculate(config, context): PriceQuote` — no DB reads, so all cases above are fast unit tests. Repository lookups (validating ids exist / active) are an **adapter** that resolves ids → prices before calling the engine; id-existence tests live in integration tests.