-- ============================================================================
-- ATLASE: analytics events (§56) — feeds the admin conversion funnel.
--   Minimal event log: type + optional order/customer link + metadata.
--   No PII beyond what's already in orders/customers (§56 "do not collect
--   unnecessary personal information" — event rows just reference those ids).
-- ============================================================================

begin;

create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  order_id uuid references public.orders(id) on delete set null,
  customer_id uuid references public.customers(id) on delete set null,
  session_id text,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_analytics_events_type_created
  on public.analytics_events(event_type, created_at desc);

-- Service-role only (no anon/authenticated policy) — matches the
-- inventory/audit pattern in 0002_rls_policies.sql. Admin reads via the
-- service-role client, same as every other admin-facing table.
alter table public.analytics_events enable row level security;

commit;
