# ATLASE — Analytics & Event Tracking

## 1. Tracking Stack

| Layer | Tool | Purpose |
|-------|------|---------|
| Product analytics | GA4 (Google Analytics 4) | Funnel visualization, audience segments, e-commerce reports |
| Event collection | Custom client-side `track()` helper | Thin wrapper around GA4 `gtag` + Supabase event sink |
| Server-side | Supabase `analytics_events` table | Back-up event store, custom reporting, warehouse joins |
| A/B (future) | GA4 experiments or LaunchDarkly | Variant assignment, conversion lift |

**Privacy-first原则**

- Never collect full name, exact address, phone number, or payment credentials in analytics events.
- Use a generated `anonymous_id` (localStorage UUIDv4) for cross-session stitching — no account required.
- If the user is authenticated, attach `user_id` (Supabase UUID) server-side only; never send it from the client.
- Respect `Do Not Track` and Indonesian PDP (Personal Data Protection Law) consent requirements.
- All GA4 data retention set to **14 months**; IP anonymization enabled.

## 2. Event Taxonomy

| Event Name | Trigger Point | Payload Fields (PII-minimal) |
|------------|---------------|------------------------------|
| `landing_page_view` | Any page entry (first or returning) | `page_path`, `referrer`, `utm_source`, `utm_medium`, `utm_campaign`, `device_category`, `connection_type` |
| `product_view` | Product detail page mounts | `product_id` (internal UUID), `product_slug`, `product_name`, `price_idr`, `category`, `source` (search / browse / recommendation) |
| `customization_started` | User places first slider or selects first option | `product_id`, `product_slug`, `fragrance_notes[]`, `customization_config` |
| `customization_completed` | User confirms final customization | `product_id`, `product_slug`, `fragrance_notes[]`, `intensity_level`, `size_ml`, `customization_duration_ms` |
| `add_to_cart` | Cart button clicked | `product_id`, `product_slug`, `quantity`, `price_idr`, `customization_hash` |
| `checkout_started` | User enters checkout flow | `cart_total_idr`, `item_count`, `payment_method_intent` |
| `whatsapp_clicked` | WhatsApp CTA clicked (checkout or PDP) | `product_id`, `product_slug`, `source_page`, `has_customization` |
| `order_created` | Order row inserted in Supabase | `order_id`, `item_count`, `total_idr`, `payment_method`, `channel` (whatsapp / web) |
| `payment_started` | Midtrans payment page opened | `order_id`, `payment_method`, `amount_idr` |
| `payment_success` | Midtrans webhook confirms settlement | `order_id`, `payment_method`, `amount_idr`, `settlement_time` |
| `payment_failed` | Midtrans returns failure or webhook error | `order_id`, `payment_method`, `failure_reason_code` (never raw gateway error text) |

**Rules:**

- Every event must include a server-generated `timestamp` (ISO 8601) and the client `anonymous_id`.
- No event payload may contain: email, phone, full name, address, card number, bank account, or password.
- `product_id` is the internal UUID — never exposed in public URLs (see SEO doc), only in analytics payloads for joins.
- Event names use `snake_case` only.

## 3. Funnel Definitions

```
Visitors ──────── Product Views ──────── Customization ──────── Cart ──────── WhatsApp/Payment ──────── Completed Order
```

| Funnel Stage | Entry Event | Exit Event | Conversion Metric |
|--------------|-------------|------------|-------------------|
| Awareness | `landing_page_view` | — | Unique visitors |
| Interest | `product_view` | — | View-to-interest rate (`product_view / landing_page_view`) |
| Intent | `customization_completed` | — | Customization rate (`customization_completed / product_view`) |
| Action | `add_to_cart` | — | Cart rate (`add_to_cart / customization_completed`) |
| Conversion | `order_created` | `payment_success` or `payment_failed` | Order conversion (`payment_success / checkout_started`) |

**Derived metrics:**

- **Visitor → Order rate** = `payment_success` unique / `landing_page_view` unique (daily, weekly, monthly).
- **Customization depth** = average number of slider adjustments before `customization_completed`.
- **WhatsApp funnel** = `whatsapp_clicked` → manual tracking via WA Business API read receipts (if available).

## 4. E-Commerce & Analytics Reporting

### Standard GA4 E-Commerce Events

Use GA4's built-in e-commerce schema (`view_item`, `add_to_cart`, `begin_checkout`, `purchase`) **in addition to** custom ATLASE events. This enables GA4's Monetization reports out of the box.

### Key Reports

| Report | Source | Refresh |
|--------|--------|---------|
| Orders by day / week / month | GA4 e-commerce + Supabase `orders` | Daily |
| Revenue (IDR) | GA4 `purchase` value + Supabase | Daily |
| Average Order Value (AOV) | Revenue / Orders | Daily |
| Conversion by channel (organic, paid, social, direct) | GA4 acquisition → e-commerce cross | Weekly |
| Top products by revenue | GA4 product-scoped events | Weekly |
| WhatsApp vs Web payment split | Custom funnel report | Weekly |
| Cohort retention (return visitors who purchase) | GA4 audience builder | Monthly |

### Dashboard

- **Primary:** GA4 Explorations (free, no extra tooling).
- **Supplementary:** Supabase SQL views joined with analytics_events for custom funnel SQL (exported to Google Sheets or Metabase when needed).

## 5. Customization Analytics

Track which customization choices drive conversion:

| Dimension | Event Field | Analysis |
|-----------|-------------|----------|
| Fragrance note combinations | `fragrance_notes[]` | Which note pairings appear most in `customization_completed` vs. abandoned |
| Intensity slider position | `intensity_level` | Distribution; correlate with `add_to_cart` rate |
| Size preference | `size_ml` | 30ml vs 50ml vs 100ml conversion by price point |
| Customization duration | `customization_duration_ms` | Sweet-spot timing; too short = low engagement, too long = abandonment |
| Source of entry | `product_view.source` | Do recommendation clicks convert better than browse/search? |

**Visualization:**

- Heatmap of note × conversion rate.
- Funnel breakdown by `size_ml`.
- Scatter plot: `customization_duration_ms` vs `add_to_cart` boolean.

## 6. Privacy Constraints

1. **Consent gate:** No analytics cookies or tracking scripts fire before the user accepts the consent banner (Indonesian PDP compliance).
2. **No auto marketing:** Email/SMS/WhatsApp marketing lists are never auto-populated from analytics events. Marketing opt-in is a separate, explicit action.
3. **Data minimization:** Collect only what is listed in §2. Any new event or field must pass a privacy review before implementation.
4. **Anonymization:** GA4 IP anonymization is on. Server-side events strip any accidentally included PII before storage.
5. **Right to deletion:** Supabase `analytics_events` rows are deletable by `anonymous_id` or `user_id` upon user request (PDP Article 26).
6. **No third-party PII sharing:** Analytics data is never shared with third parties in a PII-linkable form.

## 7. Event Plumbing in Next.js

### Client Component Wrapper

```tsx
// components/analytics/tracker.tsx
'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

export function AnalyticsTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Fire landing_page_view / page_view on route change
    track('landing_page_view', {
      page_path: pathname,
      utm_source: searchParams.get('utm_source'),
      utm_medium: searchParams.get('utm_medium'),
      utm_campaign: searchParams.get('utm_campaign'),
    })
  }, [pathname, searchParams])

  return null // Zero DOM output — no layout shift
}
```

### Placement Rules

- `<AnalyticsTracker />` is placed **inside** the `<body>` but **after** all visible content (bottom of `layout.tsx`).
- Returns `null` — renders nothing, causes **zero layout shift**.
- GA4 `gtag.js` is loaded via `next/script` with `strategy="afterInteractive"` to avoid blocking first paint.
- Consent check: `gtag('consent', 'default', { analytics_storage: 'denied' })` fires before any event; updated to `'granted'` on user acceptance.

### Server-Side Events

- `order_created`, `payment_success`, `payment_failed` are tracked **server-side** in API routes / webhook handlers using the GA4 Measurement Protocol.
- This avoids reliance on client-side scripts for critical conversion events.
