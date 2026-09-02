# ATLASE — Database Setup

This document explains how to apply the ATLASE schema, RLS policies, and seed
data to the Supabase PostgreSQL database.

> **Security note:** the database credentials are secrets. Never commit the
> connection string or password to the repository. Reference them via
> environment variables or a gitignored `.env`.

## Prerequisites

- Supabase CLI v2 (`supabase --version`) — already installed.
- A Supabase **access token** for the management API:
  - Create one at https://supabase.com/dashboard/account/tokens
  - Set it in your environment (PowerShell): `$env:SUPABASE_ACCESS_TOKEN = "<token>"`
- **or** direct Postgres reachability (project not paused, IPv4 reachable, port 5432 open).

## Option A — Supabase CLI (recommended)

From the repo root:

```powershell
# 1. Authenticate / set token
$env:SUPABASE_ACCESS_TOKEN = "<your-token>"

# 2. Link this checkout to the hosted project
pnpm db:link          # supabase link --project-ref ecztdymcmzcaffdwhjur

# 3. Apply migrations (schema + RLS)
pnpm db:push          # supabase db push

# 4. Apply seed data
pnpm db:seed          # supabase db query -f database/seeds/0001_seed.sql
```

## Option B — Direct Postgres (psql)

If you can reach Postgres directly (IPv4, port 5432 open):

```powershell
# From the repo root; the connection string is read from env, never inline
$psql = "postgres"   # adjust if psql not on PATH, e.g. full path
$env:PGHOST = "<db-host>"
$env:PGPASSWORD = "<password>"
$env:PGPORT = "5432"
$env:PGUSER = "postgres"

psql -v ON_ERROR_STOP=1 -f database/migrations/0001_initial_schema.sql
psql -v ON_ERROR_STOP=1 -f database/migrations/0002_rls_policies.sql
psql -v ON_ERROR_STOP=1 -f database/seeds/0001_seed.sql
```

> Note: If you were provided a full `postgresql://` connection string, set the
> host/password/user/port/ssl from it. The current project host
> (`db.<ref>.supabase.co`) resolves only to IPv6 from some networks; if port
> 5432 doesn't connect, the project may be paused — resume it in the dashboard
> first.

## What gets created

See `docs/database.md` for the full ERD and entity list. In short:

- Enums: `order_status`, `payment_status`, `order_channel`, `payment_method`,
  `payment_provider`, `consent_type`, `movement_type`, `pricing_version_status`.
- Tables (~27): catalog (fragrances, bottles, packaging, add_ons, pricing
  versions, fragrance_pricing, system_settings), customers (+addresses,
  consents), orders (+items, customizations, addresses, events), payments
  (+transactions, events), whatsapp_orders, inventory (+movements), admin/RBAC
  (roles, permissions, admin_users, admin_user_roles, role_permissions),
  audit_logs.
- RLS: deny-by-default everywhere; catalog read-public; customer/order/payment
  ownership read; admin/service-role only.
- Seeds: 6 RBAC roles + 14 permissions + mappings; catalog data; pricing
  version v1.0 (ACTIVE); alcohol/shipping/site settings; inventory.

## Idempotency

Migrations and seeds use `if not exists` / `on conflict do nothing`, so
re-running them is safe.

## After setup

1. Paste `postgresql://…` into `.env.local` host/password (gitignored) or set
   Supabase env vars (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`,
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
2. Storefront order persistence activates automatically once
   `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` are set.
3. Midtrans (server key) is required for live QRIS payment.