-- ATLASE: add is_featured flag to fragrances for homepage etalase.
-- Run this on Supabase via SQL Editor or `supabase db push`.

alter table public.fragrances
  add column if not exists is_featured boolean not null default false;

comment on column public.fragrances.is_featured is 'Show this fragrance on the homepage featured grid (max 6 shown).';
