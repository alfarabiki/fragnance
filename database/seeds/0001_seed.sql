-- ============================================================================
-- ATLASE: seed data (docs/content.md + docs/admin.md + packages/config catalog)
--   Roles/permissions per docs/admin.md §2 (RBAC: deny-by-default).
--   Catalog matches packages/config/src/catalog.ts so the UI and DB agree.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Admin RBAC roles & permissions
-- ---------------------------------------------------------------------------
insert into public.roles (code, name, description) values
  ('SUPER_ADMIN', 'Super Admin', 'Full access'),
  ('ADMIN', 'Admin', 'Manage everything except roles'),
  ('OPERATIONS', 'Operations', 'Orders & inventory'),
  ('FINANCE', 'Finance', 'Pricing & payments'),
  ('CONTENT_MANAGER', 'Content Manager', 'Products & images'),
  ('CUSTOMER_SERVICE', 'Customer Service', 'Orders, customers, WhatsApp')
on conflict (code) do nothing;

insert into public.permissions (code, name) values
  ('orders.read', 'Read orders'),
  ('orders.write', 'Write orders'),
  ('customers.read', 'Read customers'),
  ('products.write', 'Write products'),
  ('pricing.read', 'Read pricing'),
  ('pricing.write', 'Write pricing'),
  ('pricing.publish', 'Publish pricing'),
  ('payments.read', 'Read payments'),
  ('whatsapp.write', 'Handle WhatsApp orders'),
  ('inventory.write', 'Write inventory'),
  ('analytics.read', 'Read analytics'),
  ('audit.read', 'Read audit logs'),
  ('users.manage', 'Manage admin users & roles'),
  ('settings.write', 'Write system settings')
on conflict (code) do nothing;

-- CONTENT_MANAGER → products
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id from public.roles r join public.permissions p on p.code='products.write'
where r.code='CONTENT_MANAGER'
on conflict do nothing;

-- FINANCE → pricing + payments
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id from public.roles r join public.permissions p on p.code in ('pricing.read','pricing.write','pricing.publish','payments.read')
where r.code='FINANCE'
on conflict do nothing;

-- CUSTOMER_SERVICE → orders/customers/whatsapp
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id from public.roles r join public.permissions p on p.code in ('orders.read','orders.write','customers.read','whatsapp.write')
where r.code='CUSTOMER_SERVICE'
on conflict do nothing;

-- OPERATIONS → orders/inventory
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id from public.roles r join public.permissions p on p.code in ('orders.read','orders.write','inventory.write')
where r.code='OPERATIONS'
on conflict do nothing;

-- ADMIN → everything except users.manage
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id from public.roles r join public.permissions p where r.code='ADMIN' and p.code <> 'users.manage'
on conflict do nothing;

-- SUPER_ADMIN → all
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id from public.roles r join public.permissions p where r.code='SUPER_ADMIN'
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- Pricing version (v1.0 ACTIVE)
-- ---------------------------------------------------------------------------
insert into public.pricing_versions (label, status, published_at) values
  ('v1.0', 'ACTIVE', now())
on conflict (label) do nothing;

-- ---------------------------------------------------------------------------
-- Catalog: fragrances (matches packages/config)
-- ---------------------------------------------------------------------------
insert into public.fragrances (slug, name, reference_label, description, category, popularity_score, is_active, is_featured, min_ml, max_ml) values
  ('dior-inspired', 'Dior-inspired', 'Terinspirasi aroma elegan khas malam', 'Aroma elegan · Cocok untuk malam', 'Premium', 100, true, true, 5, 50),
  ('woody-fresh', 'Woody Fresh', 'Terinspirasi aroma kayu segar', 'Segar setiap hari', 'Daily', 90, true, true, 5, 50),
  ('sweet-vanilla', 'Sweet Vanilla', 'Terinspirasi aroma vanila manis', 'Manis dan hangat', 'Gourmand', 80, true, true, 5, 50),
  ('floral-dream', 'Floral Dream', 'Terinspirasi aroma bunga segar', 'Manis, lembut, feminin', 'Floral', 70, true, false, 5, 50),
  ('citrus-bright', 'Citrus Bright', 'Terinspirasi aroma jeruk segar', 'Penyegar pagi yang cerah', 'Fresh', 60, true, false, 5, 50),
  ('oud-royal', 'Oud Royal', 'Terinspirasi aroma oud mewah', 'Kaya, hangat, eksklusif', 'Premium', 85, true, true, 5, 50)
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------------
-- Bottles (matches packages/config)
-- ---------------------------------------------------------------------------
insert into public.bottles (slug, name, volume_ml, cost_price, sell_price, is_active) values
  ('30ml-standard', 'Standard 30 ml', 30, 6000, 9000, true),
  ('30ml-premium', 'Premium 30 ml', 30, 9000, 13000, true),
  ('50ml-standard', 'Standard 50 ml', 50, 7000, 11000, true),
  ('50ml-premium', 'Premium 50 ml', 50, 10000, 15000, true),
  ('70ml-standard', 'Standard 70 ml', 70, 9000, 13000, true),
  ('70ml-premium', 'Premium 70 ml', 70, 12000, 17000, true),
  ('100ml-standard', 'Standard 100 ml', 100, 11000, 16000, true),
  ('100ml-premium', 'Premium 100 ml', 100, 15000, 20000, true)
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------------
-- Packaging (matches packages/config)
-- ---------------------------------------------------------------------------
insert into public.packaging (slug, name, cost_price, sell_price, is_mandatory, is_active) values
  ('standard', 'Standard', 2000, 5000, false, true),
  ('premium-box', 'Premium Box', 6000, 15000, false, true),
  ('gift', 'Gift', 9000, 25000, false, true)
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------------
-- Fragrance pricing vs active version (3000/ml etc., matches config)
-- ---------------------------------------------------------------------------
insert into public.fragrance_pricing (fragrance_id, version_id, cost_per_ml, price_per_ml, active)
select f.id, v.id, f2.cost, f2.price, true
from public.fragrances f
cross join (select id from public.pricing_versions where label='v1.0') v
cross join (values
  ('dior-inspired', 1800, 3000),
  ('woody-fresh', 1100, 2000),
  ('sweet-vanilla', 1400, 2500),
  ('floral-dream', 1200, 2200),
  ('citrus-bright', 900, 1800),
  ('oud-royal', 3200, 5000)
) as f2(slug, cost, price)
where f.slug = f2.slug
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- System settings: alcohol price, shipping, FAQ (docs/pricing.md §6)
-- ---------------------------------------------------------------------------
insert into public.system_settings (key, value) values
  ('alcohol', jsonb_build_object('costPerMl', 150, 'sellPerMl', 300)),
  ('shipping', jsonb_build_object('flat', 0, 'freeMinOrder', 0)),
  ('site', jsonb_build_object('primaryTagline', 'Premium, Made Personal.', 'startingPrice', 29000))
on conflict (key) do update set value = excluded.value;

-- ---------------------------------------------------------------------------
-- Inventory ledger (bottle/packaging initial stock)
-- ---------------------------------------------------------------------------
insert into public.inventory_items (item_type, item_id, current_stock)
select 'BOTTLE', id, 100 from public.bottles
on conflict (item_type, item_id) do nothing;

insert into public.inventory_items (item_type, item_id, current_stock)
select 'PACKAGING', id, 200 from public.packaging
on conflict (item_type, item_id) do nothing;