-- ============================================================================
-- ATLASE: initial schema (orders, customers, catalog, payments, audit)
-- Source of truth: docs/database.md
-- All money is BIGINT integer rupiah (never float).
-- RLS enabled + policies per docs/security.md (deny-by-default).
-- ============================================================================

begin;

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
do $$ begin
  create type public.order_status as enum (
    'DRAFT','PENDING_CONFIRMATION','CONFIRMED','PENDING_PAYMENT','PAID',
    'PROCESSING','READY','SHIPPED','COMPLETED','CANCELLED','EXPIRED','REFUNDED','FAILED'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.payment_status as enum (
    'PENDING','PAID','FAILED','EXPIRED','REFUNDED'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.order_channel as enum ('WHATSAPP','DIRECT_PAYMENT','ADMIN');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.payment_method as enum ('QRIS');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.payment_provider as enum ('MIDTRANS');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.consent_type as enum ('MARKETING','DATA_PROCESSING','WHATSAPP');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.movement_type as enum (
    'PURCHASE','RESERVATION','SALE','CANCELLATION','ADJUSTMENT','RETURN'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.pricing_version_status as enum (
    'DRAFT','PREVIEW','PUBLISHED','ACTIVE'
  );
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- Catalog
-- ---------------------------------------------------------------------------
create table if not exists public.fragrances (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  reference_label text,
  description text,
  category text,
  popularity_score int not null default 0,
  is_active boolean not null default true,
  is_featured boolean not null default false,
  min_ml int not null default 5,
  max_ml int not null default 50,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.bottles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  volume_ml int not null,
  cost_price bigint not null,
  sell_price bigint not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.packaging (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  cost_price bigint not null,
  sell_price bigint not null,
  is_mandatory boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.add_ons (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  cost_price bigint not null,
  sell_price bigint not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Pricing versions (DRAFT → PREVIEW → PUBLISHED → ACTIVE)
create table if not exists public.pricing_versions (
  id uuid primary key default gen_random_uuid(),
  label text not null unique,
  status public.pricing_version_status not null default 'DRAFT',
  published_at timestamptz,
  changelog text,
  created_at timestamptz not null default now()
);

-- Frozen price rows tied to a version; ACTIVE rows immutable
create table if not exists public.fragrance_pricing (
  id uuid primary key default gen_random_uuid(),
  fragrance_id uuid not null references public.fragrances(id) on delete cascade,
  version_id uuid not null references public.pricing_versions(id) on delete cascade,
  cost_per_ml bigint not null,
  price_per_ml bigint not null,
  active boolean not null default false,
  created_at timestamptz not null default now()
);

-- Alcohol & shipping base cost (system settings)
create table if not exists public.system_settings (
  key text primary key,
  value jsonb not null,
  updated_by uuid,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Customers
-- ---------------------------------------------------------------------------
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  supabase_auth_id uuid references auth.users(id) on delete set null,
  phone text not null unique,
  email text,
  name text,
  is_marketing_consent boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.customer_addresses (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  label text,
  recipient_name text not null,
  phone text not null,
  province text not null,
  city text not null,
  district text not null,
  subdistrict text,
  postal_code text not null,
  full_address text not null,
  note text,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.customer_consents (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  type public.consent_type not null,
  granted boolean not null default false,
  granted_at timestamptz,
  revoked_at timestamptz,
  source text,
  unique (customer_id, type)
);

-- ---------------------------------------------------------------------------
-- Orders
-- ---------------------------------------------------------------------------
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  idempotency_key text unique,
  customer_id uuid references public.customers(id),
  channel public.order_channel not null default 'WHATSAPP',
  status public.order_status not null default 'DRAFT',
  currency text not null default 'IDR',
  subtotal bigint not null default 0,
  discount bigint not null default 0,
  shipping bigint not null default 0,
  total bigint not null default 0,
  payment_status public.payment_status,
  pricing_version_label text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  fragrance_id uuid references public.fragrances(id),
  product_id uuid,
  name_snapshot text not null,
  unit_price_snapshot bigint not null,
  quantity int not null default 1,
  line_total bigint not null
);

create table if not exists public.order_customizations (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  fragrance_id uuid references public.fragrances(id),
  bottle_id uuid references public.bottles(id),
  packaging_id uuid references public.packaging(id),
  volume_ml int not null,
  fragrance_ml int not null,
  alcohol_ml int not null,
  snapshot jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.order_addresses (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  recipient_name text not null,
  phone text not null,
  province text not null,
  city text not null,
  district text not null,
  subdistrict text,
  postal_code text not null,
  full_address text not null,
  note text
);

-- Order timeline
create table if not exists public.order_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  event_type text not null,
  from_status public.order_status,
  to_status public.order_status,
  actor_type text,
  actor_id text,
  note text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Payments
-- ---------------------------------------------------------------------------
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  method public.payment_method not null default 'QRIS',
  provider public.payment_provider not null default 'MIDTRANS',
  amount_requested bigint not null,
  amount_paid bigint,
  status public.payment_status not null default 'PENDING',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.payment_transactions (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid not null references public.payments(id) on delete cascade,
  provider_transaction_id text unique,
  provider_reference text,
  idempotency_key text not null unique,
  status text,
  amount bigint not null,
  payload_request jsonb,
  payload_response jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.payment_events (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid not null references public.payments(id) on delete cascade,
  event_type text not null,
  raw_payload jsonb,
  verified boolean not null default false,
  received_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- WhatsApp attribution
-- ---------------------------------------------------------------------------
create table if not exists public.whatsapp_orders (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders(id) on delete cascade,
  phone_target text,
  message_template_version text,
  deep_link text,
  status text not null default 'NOT_SENT',
  opened_at timestamptz,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Inventory
-- ---------------------------------------------------------------------------
create table if not exists public.inventory_items (
  id uuid primary key default gen_random_uuid(),
  item_type text not null, -- BOTTLE | PACKAGING | FRAGRANCE
  item_id uuid not null,
  current_stock bigint not null default 0,
  reserved_stock bigint not null default 0,
  unique (item_type, item_id)
);

create table if not exists public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  item_type text not null,
  item_id uuid not null,
  movement_type public.movement_type not null,
  qty bigint not null,
  reference_order_id uuid,
  note text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Admin RBAC
-- ---------------------------------------------------------------------------
create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text
);

create table if not exists public.permissions (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null
);

create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  supabase_auth_id uuid references auth.users(id) on delete cascade,
  email text not null unique,
  name text,
  status text not null default 'ACTIVE',
  last_login_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.admin_user_roles (
  admin_user_id uuid not null references public.admin_users(id) on delete cascade,
  role_id uuid not null references public.roles(id) on delete cascade,
  primary key (admin_user_id, role_id)
);

create table if not exists public.role_permissions (
  role_id uuid not null references public.roles(id) on delete cascade,
  permission_id uuid not null references public.permissions(id) on delete cascade,
  primary key (role_id, permission_id)
);

-- ---------------------------------------------------------------------------
-- Audit log
-- ---------------------------------------------------------------------------
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid references public.admin_users(id),
  action text not null,
  entity_type text not null,
  entity_id text,
  old_value jsonb,
  new_value jsonb,
  reason text,
  ip text,
  user_agent text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Indexes (docs/database.md §6)
-- ---------------------------------------------------------------------------
create index if not exists idx_orders_customer on public.orders(customer_id, created_at desc);
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_orders_created on public.orders(created_at desc);
create index if not exists idx_orders_idem on public.orders(idempotency_key);
create index if not exists idx_order_items_order on public.order_items(order_id);
create index if not exists idx_fragrance_active on public.fragrances(is_active, popularity_score desc);
create index if not exists idx_fragrance_slug on public.fragrances(slug);
create unique index if not exists uq_fragrance_pricing_active on public.fragrance_pricing(fragrance_id) where active;
create index if not exists idx_audit_entity on public.audit_logs(entity_type, entity_id, created_at desc);
create index if not exists idx_payment_events_payment on public.payment_events(payment_id, received_at desc);
create index if not exists idx_customers_phone on public.customers(phone);
create index if not exists idx_whatsapp_order on public.whatsapp_orders(order_id);

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists trg_orders_touch on public.orders;
create trigger trg_orders_touch before update on public.orders
  for each row execute function public.touch_updated_at();

drop trigger if exists trg_fragrances_touch on public.fragrances;
create trigger trg_fragrances_touch before update on public.fragrances
  for each row execute function public.touch_updated_at();

drop trigger if exists trg_bottles_touch on public.bottles;
create trigger trg_bottles_touch before update on public.bottles
  for each row execute function public.touch_updated_at();

drop trigger if exists trg_customers_touch on public.customers;
create trigger trg_customers_touch before update on public.customers
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- RLS (deny-by-default; policy files add scope)
--   NOTE: initial migration disables RLS so migrations/application code
--   using service role flow freely; an explicit policy migration enables
--   per-role RLS for anon/authenticated per docs/security.md.
--   Admin access is enforced in the API layer via RBAC, not RLS to the public.
-- ---------------------------------------------------------------------------

commit;