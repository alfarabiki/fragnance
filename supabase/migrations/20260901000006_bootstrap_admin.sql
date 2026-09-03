do $$
declare
  v_auth_id uuid;
  v_super_admin uuid;
begin
  select id into v_auth_id from auth.users where email = 'admin@atlas.com' limit 1;
  if v_auth_id is null then
    raise notice 'No auth.user with email admin@atlas.com yet.';
    return;
  end if;

  insert into public.admin_users (supabase_auth_id, email, name, status)
  values (v_auth_id, 'admin@atlas.com', 'Admin', 'ACTIVE')
  on conflict (email) do update
    set supabase_auth_id = excluded.supabase_auth_id, status = 'ACTIVE';

  select id into v_super_admin from public.roles where code = 'SUPER_ADMIN';
  if v_super_admin is not null then
    insert into public.admin_user_roles (admin_user_id, role_id)
    select au.id, v_super_admin
    from public.admin_users au where au.email = 'admin@atlas.com'
    on conflict do nothing;
  end if;

  raise notice 'Bootstrap complete for admin@atlas.com';
end $$;
