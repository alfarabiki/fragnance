-- ============================================================================
-- ATLASE: fields the storefront needs that only existed in the static
-- packages/config/src/catalog.ts fallback — badge/detail on fragrances,
-- description on packaging. Backfilled to match that file exactly so
-- switching the storefront from static import to a live DB read is a
-- no-visual-change cutover.
-- ============================================================================

alter table public.fragrances add column if not exists badge text;
alter table public.fragrances add column if not exists detail text;

alter table public.packaging add column if not exists description text;

update public.fragrances set badge = 'BEST SELLER', detail = 'Wanginya maskulin, tegas, dan berkelas. Cocok banget buat kamu yang suka tampil percaya diri.' where slug = 'dior-inspired';
update public.fragrances set badge = 'POPULAR', detail = 'Perpaduan kayu dan kesegaran yang ringan. Pas untuk aktivitas harian.' where slug = 'woody-fresh';
update public.fragrances set badge = 'NEW', detail = 'Aroma vanila yang lembut dan hangat. Cocok untuk suasana cozy.' where slug = 'sweet-vanilla';
update public.fragrances set detail = 'Lembut dan feminin. Aroma bunga yang menyegarkan suasana.' where slug = 'floral-dream';
update public.fragrances set detail = 'Segar dan cerah seperti pagi. Bikin mood langsung naik.' where slug = 'citrus-bright';
update public.fragrances set badge = 'PREMIUM', detail = 'Aroma oud yang kaya dan mewah. Untuk acara istimewa.' where slug = 'oud-royal';

update public.packaging set description = 'Simpel, rapi, langsung kirim' where slug = 'standard';
update public.packaging set description = 'Kotak eksklusif, kesan lebih mewah' where slug = 'premium-box';
update public.packaging set description = 'Siap kasih ke orang tersayang' where slug = 'gift';
