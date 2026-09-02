-- ============================================================================
-- ATLASE: bootstrap first admin user + SUPER_ADMIN role mapping.
-- Run AFTER seeding roles/permissions (0001_seed.sql).
--
-- Flow (do in Dashboard OR via this SQL):
-- 1. Create the admin user in Supabase Auth (email + password + confirm).
--    Record the returned user's UUID (auth.uid).
-- 2. Insert an admin_users row linking to that auth id.
-- 3. Grant SUPER_ADMIN (or ADMIN) role.
--
-- Idempotent: safe to re-run.
-- ============================================================================

-- Step A: link an existing auth user to admin_users by email.
-- Replace 'admin@atlase.id' with the email you created in Auth.
do $$
declare
  v_auth_id uuid;
  v_super_admin uuid;
begin
  select id into v_auth_id from auth.users where email = 'admin@atlase.id' limit 1;
  if v_auth_id is null then
    raise notice 'No auth.user with email admin@atlase.id yet. Create it in Supabase Auth first.';
    return;
  end if;

  -- upsert admin_users
  insert into public.admin_users (supabase_auth_id, email, name, status)
  values (v_auth_id, 'admin@atlase.id', 'Super Admin', 'ACTIVE')
  on conflict (email) do update
    set supabase_auth_id = excluded.supabase_auth_id, status = 'ACTIVE';

  -- grant SUPER_ADMIN
  select id into v_super_admin from public.roles where code = 'SUPER_ADMIN';
  if v_super_admin is not null then
    insert into public.admin_user_roles (admin_user_id, role_id)
    select au.id, v_super_admin
    from public.admin_users au where au.email = 'admin@atlase.id'
    on conflict do nothing;
  end if;

  raise notice 'Bootstrap complete for admin@atlase.id';
end $$;