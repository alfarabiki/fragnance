import { createClient } from "@supabase/supabase-js";

// Admin-only reads (orders, customers, payments, whatsapp_orders, audit_logs,
// admin_users, analytics_events, promotions, system_settings) go through the
// service-role key, bypassing RLS — those tables have no anon/authenticated
// SELECT policy (0002_rls_policies.sql: "Admin tables are NOT exposed to
// anon/auth; they are service-role only"). The admin app's own auth session
// (Supabase Auth cookie) only proves "logged in", never "is an admin" — RBAC
// is enforced separately in middleware.ts by checking admin_users.
export function adminDb() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}
