-- ============================================================================
-- ATLASE: per-fragrance discount + public inventory read + initial stock seed
-- ============================================================================

alter table public.fragrances
  add column if not exists discount_percent numeric not null default 0
  check (discount_percent >= 0 and discount_percent <= 100);

-- inventory_items had RLS enabled (0001) but no policy at all — deny-by-
-- default meant nobody, not even anon, could read stock. Storefront needs
-- to show "habis"/"tersedia" without a service-role key, so open SELECT the
-- same way catalog tables are (0002 §"Catalog is READ for everyone").
create policy "inventory_items_readable_by_all"
  on public.inventory_items for select to anon, authenticated using (true);

-- Seed stock rows for whatever bottles/packaging/fragrances already exist,
-- so the admin Inventory page and storefront stock badges show real numbers
-- instead of the hardcoded 100/200 placeholders that used to live in the UI.
insert into public.inventory_items (item_type, item_id, current_stock, reserved_stock)
select 'BOTTLE', id, 100, 0 from public.bottles
on conflict (item_type, item_id) do nothing;

insert into public.inventory_items (item_type, item_id, current_stock, reserved_stock)
select 'PACKAGING', id, 200, 0 from public.packaging
on conflict (item_type, item_id) do nothing;

insert into public.inventory_items (item_type, item_id, current_stock, reserved_stock)
select 'FRAGRANCE', id, 500, 0 from public.fragrances
on conflict (item_type, item_id) do nothing;
