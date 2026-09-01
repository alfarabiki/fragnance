# ATLASE — Architecture

## 1. Philosophy

**Modular monolith.** One deployable that keeps domains *separated in code* so any domain can be extracted into a service later without rewriting business logic. No microservices for the MVP.

**Source-of-truth mapping:** for any feature ask —

| Question | Answer |
|---|---|
| Where is the source of truth? | Supabase Postgres |
| How is this validated? | Zod schemas (shared) + domain rules |
| How is this persisted? | Repositories via Supabase query builder |
| How is it audited? | `audit_logs` table + payment events |
| Duplicate request? | Idempotency keys on orders, payments, webhooks |
| Payment fails? | Order stays `PENDING_PAYMENT` / `EXPIRED`, retry allowed |
| Browser closed? | Order is persisted before any redirect/deep link |
| WhatsApp not opened? | Order still exists in `WHATSAPP` channel; admin can follow up |
| Admin changes price? | Current price changes; historical snapshots immutable |
| Product unavailable? | Order creation validates availability; cart re-quotes |

## 2. Top-level structure

```text
atlase/
├── apps/
│   ├── web/          # Storefront (Next.js)
│   └── admin/        # Admin app (Next.js)
├── packages/
│   ├── ui/           # Design system components (shadcn/ui base + custom)
│   ├── pricing/      # Pricing engine (@pkg/pricing) — PURE, no I/O
│   ├── domain/       # Types, enums, state machines, domain rules
│   ├── validation/   # Zod schemas shared server/client
│   ├── config/       # Env + runtime config
│   └── types/        # Generated Supabase DB types
├── database/
│   ├── migrations/   # Supabase migrations
│   ├── schemas/      # Declarative schema (if adopted)
│   └── seeds/        # Seed data
├── docs/             # This documentation
├── infrastructure/   # IaC, CI, deployment config
└── tests/            # Cross-app E2E
```

## 3. Domain modules (bounded contexts)

```text
catalog      fragrances, products, bottles, packaging, images, visibility
pricing      cost/selling, formula, pricing versions, rules
cart         cart + items (stateless-ish, read from order seed)
orders       order aggregate, state machine, order items, customization
customers    profile, addresses, consents
payments     Midtrans abstraction, transactions, events, webhooks
whatsapp     deep link generation, message templates, channel attribution
inventory    stock, reservation, movements
admin        RBAC, dashboards, audit
analytics    events, funnel
```

Each domain lives as a TypeScript module boundary **inside the server app** (Next.js route handlers) plus pure packages where shareable (`pricing`, `domain`, `validation`).

## 4. App-level architecture (Next.js)

```mermaid
flowchart TB
  subgraph Storefront["apps/web (Next.js)"]
    R[Route Handlers /api/v1/*]
    SC[Server Components]
    CC[Client Components]
    R --> SVC[Service Layer]
    SVC --> REPO[(Supabase Client)]
    SVC --> PRICE[@pkg/pricing]
    SVC --> MID[Midtrans API]
  end
  subgraph Admin["apps/admin (Next.js)"]
    AR[Route Handlers /api/v1/admin/*]
    AC[Admin Components]
    AR --> SVC
  end
  SVC --> AUD[audit_logs]
  SVC --> Q[Queue Worker (in-process / later job service)]
```

- **Route Handlers** = thin HTTP adapters. Auth → validate (Zod) → call service → respond.
- **Service Layer** = business logic. Calls pricing engine, persists, emits events.
- **Repository** wraps Supabase queries; rows typed from generated DB types.
- **Pricing engine** is a pure package with zero I/O — unit-testable, deterministic.

## 5. Request/response flow — order creation

```text
POST /api/v1/orders
  → authenticate/identify guest (optional)
  → validate body (Zod)
  → Idempotency-Key check
  → load fragrance/bottle/packaging (current versions)
  → validate configuration against rules (min/max aroma, volume compatibility)
  → PricingService.calculate(...)  → authoritative total
  → create customer (upsert by phone) + address + consent
  → create order + order_items + order_customizations (+ price snapshot)
  → order state = DRAFT
  → create payment intent per channel if QRIS
  → respond { orderNumber, whatsappLink?, payment? }
```

## 6. Where prices are authoritative

- Customer-facing live price ticker = **optimistic preview** from the same shared algorithm rules, but a quote is confirmed via `POST /api/v1/pricing/quote` before order creation.
- Final price is recomputed server-side at order creation; any client-sent amount is ignored for authority (may be compared for tamper detection → audit log).

## 7. Concurrency & transactions

- Order creation runs in a Postgres transaction where possible.
- Idempotency keys (`idempotency_key` unique on `orders`, `payment_transactions`).
- Inventory reservation uses `UPDATE ... WHERE available >= qty` guarded decrements.

## 8. Failure design (spec §116)

| Scenario | Behavior |
|---|---|
| Repeated order POST | 409/200 with existing order; no duplicate |
| Payment webhook replay | Idempotent; state transitions guarded by enum transitions |
| Payment fails | `payment_events.failed`; order remains `PENDING_PAYMENT` |
| Browser closed mid-flow | Order already DRAFT/WAITING; resumable via lookup |
| WhatsApp not opened | Channel attr stored; admin follow-up; periodic reminder job |
| Price changed mid-cart | Re-quote at checkout; snapshot at order time |
| Product deactivated | Quote returns unavailable; cart marks stale item |

## 9. Tech decisions

| Concern | Decision | Rationale |
|---|---|---|
| Monorepo | Turborepo + pnpm | Fast, standard for Next.js |
| Framework | Next.js (App Router) both apps | Shared patterns, one language |
| DB | Supabase Postgres | Managed Postgres, RLS, storage, auth, no ops burden |
| Cache | Redis (Upstash) | Rate limiting, idempotency TTL, cache quotes |
| Storage | Supabase Storage (S3-compatible) | Product images |
| Payment | Midtrans Snap + QRIS | Largest Indonesian reach, QRIS native |
| WhatsApp | wa.me deep link v1, WaB API v2 | v1 zero-cost, structured message |
| Auth (customers) | Guest checkout + optional phone-linked account | Zero-friction conversion |
| Auth (admin) | Supabase Auth + RBAC roles, session validation | Secure default-deny |
| Types | Supabase generated TS types | Single source of DB truth |
| Validation shared | Zod in `@pkg/validation` | Server/client parity |
| Observability | Sentry + structured logs + GA4 events | See observability.md |

## 10. Domain boundaries for future extraction

`orders`, `payments`, `catalog`, `customers` are defined behind service interfaces. Extracting a service = move package + expose HTTP/RPC; the pricing engine and validation schemas move with it untouched.