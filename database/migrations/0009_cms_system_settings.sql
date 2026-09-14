-- ATLASE CMS: System settings for landing page & commerce config.
-- Run via Supabase SQL Editor or `supabase db push`.

create table if not exists public.system_settings (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  value jsonb not null,
  description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS: Admin (service-role) can do everything, public can only read
alter table public.system_settings enable row level security;

create policy "Allow service role all"
  on public.system_settings for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy "Allow anon read"
  on public.system_settings for select
  using (true);

comment on table public.system_settings is 'Centralized CMS settings for the storefront. Managed via admin.mizparfume.com';
comment on column public.system_settings.key is 'Unique identifier, e.g., hero.title';
comment on column public.system_settings.value is 'JSON value for the setting';

-- Seed initial data
insert into public.system_settings (key, value, description)
values
  ('hero', '{"eyebrow": "Premium · Made Personal", "title": "PREMIUM FRAGRANCE.", "subtitle": "MADE PERSONAL.", "description": "Parfum premium yang bisa kamu sesuaikan dengan aroma dan budget kamu.", "ctaText": "Pilih Aroma", "ctaLink": "/buat-parfum"}'::jsonb, 'Hero section content'),
  ('footer', '{"copyright": "Parfum Premium, Sesuai Kamu. © %d Miz.", "address": "Padang, Sumatera Barat", "phone": "6287887753802", "instagram": "@mizparfume", "tiktok": "@mizparfume"}'::jsonb, 'Footer content'),
  ('checkout', '{"step1Title": "Pesananmu", "step2Title": "Alamat Pengiriman", "step3Title": "Cara Pesan", "notePlaceholder": "Catatan tambahan..."}'::jsonb, 'Checkout flow text'),
  ('social_proof', '{"testimonials": [{"name": "Siti", "role": "Ibu Rumah Tangga", "quote": "Wanginya tahan lama, harganya cocok!"}, {"name": "Andi", "role": "Mahasiswa", "quote": "Gampang banget atur kekuatannya."}, {"name": "Rina", "role": "Karyawan", "quote": "Pesan via WhatsApp, langsung diantar."}]}'::jsonb, 'Testimonials section'),
  ('faq', '{"items": [{"q": "Berapa harga parfumnya?", "a": "Mulai dari Rp29.000. Harga naik sesuai ukuran dan kekuatan aroma."}, {"q": "Bisa pilih ukuran?", "a": "Tentu. Kamu bisa pilih 30, 50, 70, atau 100 ml."}, {"q": "Bisa menentukan kekuatan aroma?", "a": "Bisa. Atur lewat Atur Kekuatan Aroma — dari Lembut hingga Kuat."}, {"q": "Bisa pesan lewat WhatsApp?", "a": "Bisa. Itu cara paling mudah. Kamu tinggal lanjut ke WhatsApp setelah pilih parfum."}, {"q": "Bisa bayar dengan QRIS?", "a": "Bisa. Bayar via QRIS langsung dari halaman pembayaran."}]}'::jsonb, 'FAQ items')
on conflict (key) do nothing;
