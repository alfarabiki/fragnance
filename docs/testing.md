# Testing Strategy — ATLASE

## 1. Testing Pyramid

```
        ╱╲
       ╱E2E╲         Fewer, slower, highest confidence
      ╱──────╲
     ╱  Integ  ╱╲    Moderate count, moderate speed
    ╱──────────╱
   ╱    Unit    ╱╲   Many, fast, isolated
  ╱────────────╱
```

- **Unit**: Fast, isolated, many cases. Pricing engine, validation, state machine, formula logic.
- **Integration**: Database, API contracts, third-party mocks (Midtrans, WhatsApp).
- **E2E**: Full browser journeys via Playwright. Two paths: WhatsApp and QRIS.
- **Security**: Targeted tests for common web vulnerabilities and business logic abuse.

## 2. Unit Tests

### Pricing Engine (spec §107 reference case)

The canonical pricing test case:

| Component | Rate | Quantity | Subtotal |
|-----------|------|----------|----------|
| Fragrance | Rp 3.000/ml | 20 ml | Rp 60.000 |
| Alcohol | Rp 300/ml | 30 ml | Rp 9.000 |
| Bottle | Rp 11.000 | 1 | Rp 11.000 |
| Packaging | Rp 5.000 | 1 | Rp 5.000 |
| **Total** | | | **Rp 85.000** |

### Pricing Test Matrix

| Case | Description | Expected |
|------|-------------|----------|
| Minimum volume | 30 ml, minimum fragrance ml per formula | Correct total |
| Maximum volume | 100 ml, maximum fragrance ml | Correct total |
| Invalid volume | Volume not in presets | Rejected |
| Zero quantity | Cart item with qty = 0 | Rejected |
| Zero fragrance ml | No fragrance selected | Rejected |
| Unavailable fragrance | Fragrance marked unavailable | Rejected |
| Unavailable bottle | Bottle not in stock | Rejected |
| Price version change | Component price changes between preview and quote | Server-authoritative total wins |
| Discount applied | Percentage or fixed discount active | Discount subtracted correctly |
| Discount expired | Discount past expiry | Full price charged |
| Rounding | Non-integer intermediate values | Final total rounded to integer rupiah, no floating point errors |
| Multiple fragrances | 2+ fragrances with individual min/max | Sum validated, proportional ml |

### Validation Tests

| Case | Input | Expected |
|------|-------|----------|
| Empty fragrance list | `[]` | Error: "Pilih minimal satu aroma dulu, ya." |
| Fragrance below min | 5 ml where min = 10 ml | Error: aroma min threshold |
| Fragrance above max | 40 ml where max = 30 ml | Error: aroma max threshold |
| Total exceeds volume | Fragrance sum > selected volume | Error: total exceeds volume |
| No volume selected | null volume | Error: volume required |
| No bottle selected | null bottle | Error: bottle required |
| Bottle mismatch | Bottle capacity ≠ volume | Error: bottle mismatch |
| Mandatory packaging skipped | No packaging when mandatory | Error: packaging required |
| Invalid address cascade | Kelurahan doesn't match Kecamatan | Error: invalid address |

### Order State Machine

| Transition | From | To | Valid? |
|------------|------|----|--------|
| Create order | — | PENDING_PAYMENT | ✅ |
| QRIS settled | PENDING_PAYMENT | PAID | ✅ |
| QRIS expired | PENDING_PAYMENT | EXPIRED | ✅ |
| QRIS denied | PENDING_PAYMENT | CANCELLED | ✅ |
| WhatsApp confirmed | PENDING_PAYMENT | PAID | ✅ |
| PAID → PAID (replay) | PAID | PAID | ✅ (idempotent) |
| CANCELLED → PAID | CANCELLED | PAID | ❌ |
| EXPIRED → PAID | EXPIRED | PAID | ❌ |
| PAID → PENDING_PAYMENT | PAID | PENDING_PAYMENT | ❌ |

## 3. Integration Tests

### Database

- Order creation persists all fields correctly (customization snapshot, customer data, address, pricing).
- Cart CRUD operations work as expected.
- Cascading address lookups return correct data.

### Pricing API

- `POST /api/v1/pricing/quote` returns authoritative total matching server-side engine.
- Rejects invalid payloads (missing fragrance, volume mismatch, unavailable items).
- Response time within acceptable threshold (< 500 ms).

### Order Creation

- Idempotency: sending the same idempotency key twice returns the same order, no duplicate created.
- Re-quote: server recomputes price; client-submitted total is ignored.
- Snapshot immutability: post-creation, the order customization cannot be modified.

### Midtrans Mock

- Transaction creation returns QR payload.
- Status polling returns expected states (pending, settlement, expire, deny).
- Webhook notification is received and processed correctly.
- Webhook signature verification passes for valid signatures, rejects invalid.

### WhatsApp Message Generation

- Deep link URL is correctly formatted with phone number and encoded message.
- Message content includes all customization details, order number, and total.
- Special characters in fragrance names are properly encoded.

## 4. E2E Tests (Playwright)

### Journey 1: WhatsApp Path

```
Landing → Product Detail → Customize (7 steps) → Add to Cart
  → Open CartDrawer → Proceed to Checkout
  → Fill Customer Data (Nama, Nomor WhatsApp)
  → Fill Address (all fields)
  → Select WhatsApp as payment method
  → Submit Order
  → Verify WhatsApp deep link is generated
  → Verify order confirmation screen
```

### Journey 2: QRIS Path

```
Landing → Product Detail → Customize (7 steps) → Add to Cart
  → Open CartDrawer → Proceed to Checkout
  → Fill Customer Data (Nama, Nomor WhatsApp)
  → Fill Address (all fields)
  → Select QRIS as payment method
  → Submit Order
  → Verify QR code is displayed
  → Simulate Midtrans settlement (mock)
  → Verify order status transitions to PAID
  → Verify order confirmation screen with correct total
```

### Additional E2E Scenarios

- Edit customization from cart without losing item.
- Back navigation through customization steps.
- Browser refresh during QRIS — order persists, QR regenerates.
- Cart persistence across page reloads.
- `prefers-reduced-motion` — verify reduced animation path.

## 5. Security Tests

### Price Tampering

| Test | Method | Expected |
|------|--------|----------|
| Client-side total override | Modify request body total to Rp 1 | Server re-quotes, charges correct amount |
| Negative price injection | Send negative values for components | Rejected by server validation |
| Integer overflow | Send `999999999999` as price | Handled gracefully, no crash |

### Quantity Manipulation

| Test | Method | Expected |
|------|--------|----------|
| Zero quantity | Submit order with qty = 0 | Rejected |
| Negative quantity | Submit order with qty = -1 | Rejected |
| Excessive quantity | Submit order with qty = 99999 | Rate-limited or rejected |

### Product & ID Manipulation

| Test | Method | Expected |
|------|--------|----------|
| Invalid product ID | Non-existent UUID | Rejected |
| Deleted product | Product removed from DB | Rejected |
| Swapped product | Different product ID in payload | Server validates against session/cart |

### Authentication & Authorization

| Test | Method | Expected |
|------|--------|----------|
| Unauthorized admin routes | Unauthenticated access to /admin/* | 401/403 |
| Privilege escalation | Regular user accessing admin API | Rejected |
| CSRF on order creation | Cross-origin form submission | CSRF token required, rejected without |

### Webhook Security

| Test | Method | Expected |
|------|--------|----------|
| Invalid signature | Tampered webhook body | Rejected |
| Replay attack | Resubmit same webhook | Idempotent — no duplicate state change |
| Replay with modified payload | Same timestamp, different body | Signature mismatch, rejected |

### Injection

| Test | Method | Expected |
|------|--------|----------|
| SQLi in search/filter | `' OR 1=1 --` in query params | Parameterized queries, no injection |
| XSS in address notes | `<script>alert(1)</script>` in Catatan field | Escaped on render, no execution |
| XSS in fragrance name | Stored XSS via admin-uploaded name | Escaped on all output surfaces |

### Rate Limiting

| Test | Method | Expected |
|------|--------|----------|
| Rapid order creation | 100 requests/min from same session | Rate-limited after threshold |
| Rapid payment polling | 1000 polls in 10 seconds | Rate-limited |
| Login brute force | 100 failed attempts | Account locked or CAPTCHA enforced |

## 6. CI Wiring

```bash
# Run full test suite via Turborepo
turbo test

# Turbo caches per-package; only re-runs changed packages
# CI pipeline:
#   1. Lint
#   2. Type check
#   3. Unit tests (parallel across packages)
#   4. Integration tests (parallel, services started via docker-compose or testcontainers)
#   5. E2E tests (Playwright, after build)
```

- Unit and integration tests run on every PR.
- E2E tests run on PR merge to main and on nightly.
- Security tests run on every PR (static analysis) and weekly (DAST if deployed).

## 7. Fixtures & Seed Data Strategy

### Fixtures

| Fixture | Purpose |
|---------|---------|
| `fragrances.json` | 5–10 fragrances with varying min/max ml, prices, availability |
| `volumes.json` | 30, 50, 70, 100 ml presets |
| `bottles.json` | Bottles for each volume, with prices and availability |
| `packaging.json` | 3–5 packaging options with prices |
| `customers.json` | 2–3 test customer profiles |
| `addresses.json` | Valid Indonesian addresses covering multiple provinces |
| `pricing-config.json` | Alcohol price per ml, active discounts, price versions |

### Seed Data Strategy

- **Unit tests**: Each test creates its own minimal state inline — no shared seed.
- **Integration tests**: Seed a fresh database per test suite (or per test with transaction rollback). Use fixtures for consistent baseline.
- **E2E tests**: Seed a full catalog before the test suite runs. Use unique order IDs per test to avoid collisions. Clean up after suite completion.
- **Staging/dev**: Full seed script populates realistic catalog, sample orders, and admin config. Run on every environment reset.
