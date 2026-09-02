# ATLASE — Development Roadmap

---

## 1. Guiding Rules

1. **Vertical slices.** Each phase ships a complete, usable feature — not a horizontal layer across the stack.
2. **Every phase is deployable.** After each phase, the app can go to production with whatever is built so far. No "it only works when all 12 phases are done."
3. **No giant single steps.** If a phase feels too large, break it into sub-phases (e.g., 3a, 3b) — but never skip ahead.
4. **P0 first.** Ship all P0 items before touching P1. P1 before P2.
5. **Real data, real payments.** Test with real WhatsApp messages and real Midtrans QRIS from Phase 5 onward — no mocking payment flows past MVP.

---

## 2. Phase Table

| Phase | Name | What Ships | Acceptance Criteria | Priority |
|-------|------|-----------|---------------------|----------|
| **0** | System Design | Architecture docs, DB schema, component library planning, design tokens | All docs reviewed, schema finalized, dev environment running | — |
| **1** | Foundation + Design System | Next.js project, Tailwind config, layout components (header, footer, nav), responsive grid, dark theme foundation, typography scale | App renders on mobile + desktop, all design tokens applied, Lighthouse perf ≥ 90 | P0 |
| **2** | Catalog | Product listing page, product detail page, product card component, filtering by category, search, sorting | All 6 seed products display correctly with images, descriptions, pricing; responsive grid | P0 |
| **3** | Customization Engine | Build-your-own-perfume flow: size selector (30/50/100ml), scent strength picker, custom label input, live price preview | User can configure a product and see updated price in real time; state persists across steps | P0 |
| **4** | Pricing Engine | Dynamic price calculation (base × ml), volume discount tiers, display "Mulai dari Rp29.000" correctly, strikethrough pricing | Price updates instantly on size change; volume discounts apply at correct thresholds | P0 |
| **5** | Cart + Order | Shopping cart (add/remove/update qty), customer data form (name, phone, email), address form (province/city/district), order summary, WhatsApp order submission | Full flow from product → cart → checkout → WhatsApp message with order details sent | P0 |
| **6** | WhatsApp | WhatsApp Business integration, pre-filled order message template, floating CTA button, order confirmation flow | Clicking checkout sends structured order to WhatsApp Business number; message includes all order details | P0 |
| **7** | Midtrans QRIS | QRIS payment option, Midtrans integration, payment status callback, order status update on payment confirmation | Customer can scan QRIS → pay → order status updates to "Paid" | P1 |
| **8** | Admin | Admin dashboard: product CRUD, order management (view/update status), pricing management, basic auth | Admin can create/edit/delete products, view orders, update status — all without code changes | P0 |
| **9** | Inventory | Stock tracking per size variant, low-stock alerts, out-of-stock disable, stock movement log | Admin sees stock levels; product auto-disables when stock = 0; alert at threshold | P1 |
| **10** | Analytics | Basic dashboard: orders by day, revenue, top products, conversion funnel, WhatsApp click rate | Admin can view last 7/30 day stats; data updates within 24 hours | P1 |
| **11** | Security Hardening | Rate limiting, input validation, CSRF protection, CSP headers, admin auth hardening, audit logging | Pen-test pass on checkout flow; no open redirects; admin requires secure auth | P1 |
| **12** | Performance + Production | Image optimization pipeline, CDN caching, lazy loading, ISR/SSG where applicable, monitoring, error tracking, deployment automation | Lighthouse ≥ 95 on mobile; images under byte budgets; zero unhandled errors in production | P1 |

---

## 3. MVP Priority Rubric

### P0 — Must Ship for Launch

These features define a sellable product. Without them, ATLASE cannot take orders.

- Landing page (hero, how-it-works, featured fragrances, FAQ)
- Catalog (product listing, filtering, search)
- Product detail page (description, pricing, images)
- Customization engine (size selection, price preview)
- Dynamic pricing (base × ml, volume discounts)
- Cart (add/remove/update)
- Customer data collection (name, phone, email)
- Address form (province/city/district)
- WhatsApp order submission
- Order creation (persisted in database)
- Admin: product CRUD
- Admin: order management
- Admin: pricing management

### P1 — Post-Launch (Month 1–3)

Important for operations and growth but not blocking launch.

- Midtrans QRIS payment
- Inventory management
- Analytics dashboard
- Promotions engine (discount codes, bundles)
- Audit logging
- Security hardening
- Performance optimization

### P2 — Growth Phase (Month 3–6+)

Scale features — only after P0+P1 are stable and orders are flowing.

- CRM (customer profiles, order history)
- WhatsApp Business API (template messages, automated follow-ups)
- Loyalty program
- Referral system
- AI-powered recommendations
- Marketplace integration (Tokopedia, Shopee)

---

## 4. Current Status

_Last verified: 2026-09-02 against `git log` + `atlase/e2e/tests/`._

| Phase | Status | Notes |
|-------|--------|-------|
| Phase 0 — System Design | ✅ Complete | Architecture docs, schema, design tokens finalized |
| Phase 1 — Foundation | ✅ Complete | Next.js 15 App Router (web+admin), Tailwind v4, `@atlase/ui` design tokens, `@atlase/domain`, `@atlase/types` |
| Phase 2 — Catalog | ✅ Complete | `@atlase/pricing` engine, catalog seed data, product listing/detail. Per-product SEO metadata (title/description/canonical/OG) added 2026-09-02 — was previously missing entirely (§58) |
| Phase 3 — Customization Engine | ✅ Complete | `/buat-parfum` 5-step builder, live price preview |
| Phase 4 — Pricing Engine | ✅ Complete | Server-authoritative pricing via `@atlase/pricing`, volume tiers |
| Phase 5 — Cart + Order | ✅ Complete | Cart drawer, checkout stepper (Pesanan→Alamat→Cara Pesan), order persistence API. *(2026-09-02: fixed three bugs found while wiring this up — (1) the checkout page never actually called this API, so address/customer data was discarded client-side; (2) `generateOrderNumber` used a browser-only `localStorage` counter that threw when called server-side; (3) `order_items`/`order_customizations` inserted the static catalog string ids (e.g. `"b50-s"`) directly into `bottle_id`/`packaging_id`/`fragrance_id`, which are `uuid` FK columns — every real insert would have failed with an invalid-UUID error. Fixed by resolving catalog slugs to DB row ids before insert.)* Consent records (`customer_consents`: `DATA_PROCESSING` always, `WHATSAPP` when that's the channel) are now written at order creation — `MARKETING` is intentionally never auto-granted (§57), pending an explicit opt-in checkbox the checkout form doesn't collect yet. |
| Phase 6 — WhatsApp | ✅ Complete | `wa.me` handoff with structured §6 message using real customer/address data, E2E-covered (`full-whatsapp.spec.ts`). *(2026-09-02: fixed — message previously used a hardcoded fake name/phone and empty address.)* |
| Phase 7 — Midtrans QRIS | 🟡 Partial | Backend transaction creation + webhook signature verification (idempotent) work. Payment page now calls the real API and polls server-verified status instead of a client-side 8s fake-success timer *(2026-09-02 fix)* — but this only activates when Supabase/Midtrans env vars are configured; untested against real sandbox credentials end-to-end |
| Phase 8 — Admin | ✅ Complete | Supabase Auth login, RBAC shell (14 modules), pricing simulator, orders, inventory, promotions, analytics — wired to real Supabase, not mocked |
| Phase 9 — Inventory | 🟡 Partial | Stock reservation on order creation and SALE/CANCELLATION conversion on webhook payment confirmation/expiry now wired (`apps/web/lib/inventory.ts`, 2026-09-02). Still missing: out-of-stock auto-disable on the storefront, admin UI verified against real movement rows |
| Phase 10 — Analytics | 🟡 Partial | Funnel events now tracked (2026-09-02): `add_to_cart`, `checkout_started`, `whatsapp_clicked` client-side; `order_created`, `payment_started`, `payment_success`, `payment_failed` server-side. New `analytics_events` table (migration `0003`). Still missing: `landing_page_view`/`product_view`/`customization_*` page-view events, admin dashboard wired to read this table |
| Phase 11 — Security Hardening | 🟡 Partial | In-memory rate limit + origin check on `/api/orders`/`/api/payments`. CSP + security headers on both apps. Sentry SDK scaffolded (no-op until DSN set). Order creation is idempotent (client-supplied key). Still missing: shared (multi-instance) rate limiting via Redis |
| Phase 12 — Performance + Production | ⬜ Not started | No Vercel project linked (`.vercel/` absent), no Sentry, no Cloudflare — all documented in `infrastructure.md` as target state only |

**Next action:** Verify Phase 9/10 end-to-end (inventory movements, analytics events actually recording), then start Phase 11 (rate limiting + CSRF) before any production traffic.

---

## 5. Future Scalability Boundaries

These features are **planned but explicitly out of MVP scope.** They represent natural growth paths once the core business is validated.

| Feature | Phase | Boundary |
|---------|-------|----------|
| WhatsApp Business API | P2 | Replace manual WhatsApp with automated template messages, order tracking links, delivery notifications |
| CRM | P2 | Customer profiles, order history, purchase patterns, segmentation |
| Marketplace integration | P2 | Sync products to Tokopedia / Shopee; inventory sync; order routing |
| ERP integration | Future | Connect to accounting/inventory management systems (e.g., HashMicro, Accurate) |
| Warehouse management | Future | Multi-warehouse stock, fulfillment routing, pick-pack-ship workflow |
| Loyalty program | P2 | Points per purchase, tier system, reward redemption |
| Membership | Future | Monthly membership with perks, early access, exclusive scents |
| Subscription | Future | Auto-refill subscription for repeat buyers; frequency customization |
| Affiliate program | Future | Referral links, commission tracking, payout management |
| Referral system | P2 | Give X get Y referral mechanic, tracked via unique codes |
| AI recommendation | P2 | Scent quiz → personalized recommendations based on preferences |
| Multi-store | Future | Multiple physical locations with independent inventory and pricing |

**These are planning placeholders only.** No architecture decisions should be made for these until the core platform is validated with real orders.

---

## 6. Out of Scope (MVP)

The following are **explicitly excluded** from the ATLASE MVP. These decisions reduce complexity and accelerate time-to-first-order.

| Excluded | Reason |
|----------|--------|
| Kubernetes | Overkill for single-server/small VPS deployment at MVP stage |
| Microservices | Monolith first; split only when measurable pain demands it |
| WebGL / 3D bottle rendering | Heavy, slow, low ROI for fragrance ecommerce |
| Native mobile app | PWA / responsive web is sufficient for launch |
| Multi-currency / international | Indonesia-only for MVP |
| Multi-language (beyond ID/EN) | Two languages max; EN is secondary |
| Real-time inventory sync with marketplaces | P2 feature, not MVP |
| Custom email domain / transactional email | WhatsApp handles all customer comms at MVP |
| Advanced SEO (programmatic pages) | Basic on-page SEO only; programmatic pages are P2 |
| A/B testing framework | Manual iteration first; tooling later |
