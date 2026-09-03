-- ============================================================================
-- ATLASE: fragrance photo/video + product-media storage bucket (§45, §16)
-- ============================================================================

begin;

alter table public.fragrances
  add column if not exists image_url text,
  add column if not exists video_url text;

-- Storage bucket for admin-uploaded product photos/videos. Public read (the
-- storefront hotlinks these directly), writes only via the admin API routes
-- (service role — bypasses RLS, so no anon/authenticated write policy here).
insert into storage.buckets (id, name, public)
values ('product-media', 'product-media', true)
on conflict (id) do nothing;

create policy "product_media_public_read"
  on storage.objects for select
  using (bucket_id = 'product-media');

commit;
