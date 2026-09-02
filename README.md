# ATLASE

> **Premium, Made Personal.** — Parfum Premium, Sesuai Kamu.

ATLASE is an end-to-end fragrance commerce platform: luxury-look discovery,
accessible Indonesian pricing, personalized fragrance formulation, WhatsApp-first
ordering, direct QRIS (Midtrans) payment, centralized customer data, and
admin-controlled dynamic pricing.

**Luxury visual. Accessible price.** — *"Website-nya kelihatan mahal, tapi ternyata harganya murah."*

---

## Stack

| Layer | Tech |
|---|---|
| Monorepo | Turborepo + pnpm workspaces |
| Apps | `apps/web` (storefront), `apps/admin` (shadcn/base-ui) — both Next.js 15 App Router |
| Packages | `@atlase/ui` (design tokens + primitives), `@atlase/pricing` (pure pricing engine), `@atlase/domain` (enums + order state machine), `@atlase/config` (catalog seeds), `@atlase/types` (entities) |
| Database | Supabase PostgreSQL (RLS, migrations, seeds) |
| Payments | Midtrans (QRIS) — sandbox/production via env |
| Commerce | WhatsApp-first ordering + QRIS |
| Frontend UI | Tailwind v4 + shadcn (admin), custom `@atlase/ui` (storefront) |
| Tests | Vitest (unit), Playwright (E2E) — 2 full journeys |
| Deploy | Vercel (web + admin) + GitHub Actions CI |

## Architecture

```
apps/web  (storefront) ─┐
apps/admin (shadcn UI) ─┤  →  @atlase/pricing, @atlase/domain,
                         │      @atlase/config, @atlase/types, @atlase/ui
                         ▼
              Supabase (Postgres + RLS)  +  Midtrans QRIS  +  WhatsApp
```

Source-of-truth mapping (see `docs/architecture.md`):
- **DB** = system of record (orders, customers, payments, catalog).
- **Pricing** = computed server-side by `@atlase/pricing` (§16/§49); frontend only previews.
- **WhatsApp** = communication channel only; the DB always persists first.
- **Money** = integer rupiah (`89000` = Rp89.000), no floats.

## Quickstart

```bash
git clone <repo> && cd atlase
pnpm install

# Unit tests + typecheck
pnpm test
pnpm typecheck

# Storefront dev (port 3000)
pnpm --filter @atlase/web dev

# Admin dev (port 3001)
pnpm --filter @atlase/admin dev

# E2E (boots storefront via Playwright webServer)
pnpm test:e2e
```

## Database Setup

Migrations + seeds live in `database/`. They are validated idempotent SQL.

```bash
# Requires: env SUPABASE_ACCESS_TOKEN + reachable project
pnpm db:link    # supabase link --project-ref <ref>
pnpm db:push    # apply migrations (schema + RLS)
pnpm db:seed    # seed catalog, RBAC roles, admin bootstrap
```

See [`docs/database-setup.md`](./docs/database-setup.md) for the full flow
(CLI and direct-psql options).

## Environment

Copy `.env.example` to `.env.local` and fill secrets. Never commit real values.

| Variable | Scope | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | public | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | public | anon client key |
| `SUPABASE_URL` | server | same URL for service-role |
| `SUPABASE_SERVICE_ROLE_KEY` | server | order/payment persistence (bypasses RLS) |
| `MIDTRANS_SERVER_KEY` | server | QRIS transaction + webhook verification |
| `MIDTRANS_IS_SANDBOX` | server | `true` = sandbox, `false` = production |

## Scripts

```bash
pnpm dev           # turbo dev (both apps)
pnpm build         # turbo build (all packages + apps)
pnpm lint          # turbo lint
pnpm typecheck     # turbo typecheck (strict TS everywhere)
pnpm test          # turbo test (unit)
pnpm test:e2e      # Playwright E2E (WhatsApp + QRIS full journeys)
db:link / db:push / db:seed   # Supabase migrations + seeds
```

## What's Implemented (E2E)

- **Storefront**: landing (12 sections), fragrance builder `/buat-parfum`
  (5-step with live pricing), product detail `/produk/[slug]`, cart drawer,
  checkout stepper (Pesanan→Alamat→Cara Pesan), WhatsApp handoff
  (`wa.me` + structured §6 message), QRIS payment, order success.
- **Admin**: Supabase Auth login, RBAC shell (sidebar, 14 modules), dashboard,
  pricing manager (simulator + version tiers), orders, inventory, promotions,
  analytics.
- **Backend**: order persistence API (server-side authoritative pricing),
  Midtrans QRIS transaction + webhook signature verification (idempotent),
  RLS policies.
- **Database**: 27 tables, 8 enums, RLS deny-by-default, seeds (catalog + RBAC),
  admin bootstrap.

## Documentation

The `/docs` directory is the system design source of truth (34 files):
architecture, database (ERD), pricing engine, api, ux, ui, design-system,
security, privacy, analytics, seo, performance, roadmap, and more. Start at
[`docs/README.md`](./docs/README.md).

## License

Proprietary / internal — see your organization's policy. Not licensed for
redistribution.