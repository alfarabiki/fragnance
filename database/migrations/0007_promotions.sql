-- ============================================================================
-- ATLASE: promotions/coupons (§80) — admin-managed, applied server-side only.
--   No anon/authenticated read policy: coupon codes must not be scrapeable,
--   and "which promos exist" is commercially sensitive. Same pattern as
--   whatsapp_orders/audit_logs (0002_rls_policies.sql) — service-role only.
-- ============================================================================

begin;

do $$ begin
  create type public.promotion_type as enum ('PERCENTAGE', 'FIXED');
exception when duplicate_object then null; end $$;

create table if not exists public.promotions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type public.promotion_type not null,
  value bigint not null,
  min_order bigint not null default 0,
  target_fragrance_id uuid references public.fragrances(id) on delete cascade,
  target_bottle_id uuid references public.bottles(id) on delete cascade,
  target_volume_ml int,
  customer_segment text,
  coupon_code text unique,
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_promotions_active on public.promotions(is_active, starts_at, ends_at);
create index if not exists idx_promotions_coupon on public.promotions(coupon_code);

drop trigger if exists trg_promotions_touch on public.promotions;
create trigger trg_promotions_touch before update on public.promotions
  for each row execute function public.touch_updated_at();

alter table public.promotions enable row level security;

commit;
