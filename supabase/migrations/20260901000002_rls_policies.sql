-- ============================================================================
-- ATLASE: RLS policies (docs/security.md + Supabase security checklist)
--   - Every table in `public` gets RLS enabled.
--   - Customers own their rows (auth.uid() match). Guests are anonymous and
--     get a clean, empty dataset until they complete orders (no data leak).
--   - Catalog (fragrances/bottles/packaging/pricing) is READ for everyone
--     (anon) — public storefront data.
--   - Order rows are readable by the owning customer only; writes are guarded.
--   - Admin tables are NOT exposed to anon/auth; they are service-role only.
-- ============================================================================

begin;

-- ---------------------------------------------------------------------------
-- Catalog: read-only for all (anon + authenticated)
-- ---------------------------------------------------------------------------
alter table public.fragrances enable row level security;
alter table public.bottles enable row level security;
alter table public.packaging enable row level security;
alter table public.add_ons enable row level security;
alter table public.fragrance_pricing enable row level security;
alter table public.pricing_versions enable row level security;
alter table public.system_settings enable row level security;

create policy "fragrances_readable_by_all"
  on public.fragrances for select to anon, authenticated using (true);
create policy "bottles_readable_by_all"
  on public.bottles for select to anon, authenticated using (true);
create policy "packaging_readable_by_all"
  on public.packaging for select to anon, authenticated using (true);
create policy "add_ons_readable_by_all"
  on public.add_ons for select to anon, authenticated using (true);
create policy "fragrance_pricing_readable_by_all"
  on public.fragrance_pricing for select to anon, authenticated using (true);
create policy "pricing_versions_readable_by_all"
  on public.pricing_versions for select to anon, authenticated using (true);
create policy "system_settings_readable_by_all"
  on public.system_settings for select to anon, authenticated using (true);

-- Catalog writes: service role only (blocked for anon/authenticated by absence of policies)

-- ---------------------------------------------------------------------------
-- Customers: owner-only
-- ---------------------------------------------------------------------------
alter table public.customers enable row level security;
alter table public.customer_addresses enable row level security;
alter table public.customer_consents enable row level security;

create policy "customers_own_row"
  on public.customers for select to authenticated
  using ( (select auth.uid()) = supabase_auth_id );

create policy "customer_addresses_own"
  on public.customer_addresses for select to authenticated
  using ( (select auth.uid()) = (select c.supabase_auth_id from public.customers c where c.id = customer_id) );

create policy "customer_consents_own"
  on public.customer_consents for select to authenticated
  using ( (select auth.uid()) = (select c.supabase_auth_id from public.customers c where c.id = customer_id) );

-- ---------------------------------------------------------------------------
-- Orders: owner read, service-role writes (system of record)
-- ---------------------------------------------------------------------------
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_customizations enable row level security;
alter table public.order_addresses enable row level security;
alter table public.order_events enable row level security;

create policy "orders_own_row_read"
  on public.orders for select to authenticated
  using (
    (select auth.uid()) = (
      select c.supabase_auth_id from public.customers c where c.id = customer_id
    )
  );

create policy "order_items_own_read"
  on public.order_items for select to authenticated
  using (
    (select auth.uid()) = (
      select c.supabase_auth_id from public.customers c
      join public.orders o on o.customer_id = c.id
      where o.id = order_id
    )
  );

create policy "order_customizations_own_read"
  on public.order_customizations for select to authenticated
  using (
    (select auth.uid()) = (
      select c.supabase_auth_id from public.customers c
      join public.orders o on o.customer_id = c.id
      where o.id = order_id
    )
  );

-- ---------------------------------------------------------------------------
-- Payments: owner read, service-role writes
-- ---------------------------------------------------------------------------
alter table public.payments enable row level security;
alter table public.payment_transactions enable row level security;
alter table public.payment_events enable row level security;

create policy "payments_own_read"
  on public.payments for select to authenticated
  using (
    (select auth.uid()) = (
      select c.supabase_auth_id from public.customers c
      join public.orders o on o.customer_id = c.id
      where o.id = order_id
    )
  );

-- ---------------------------------------------------------------------------
-- WhatsApp / inventory / audit / admin / RBAC: service-role only (no anon/auth policy)
-- ---------------------------------------------------------------------------
alter table public.whatsapp_orders enable row level security;
alter table public.inventory_items enable row level security;
alter table public.inventory_movements enable row level security;
alter table public.audit_logs enable row level security;
alter table public.admin_users enable row level security;
alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.admin_user_roles enable row level security;
alter table public.role_permissions enable row level security;

commit;