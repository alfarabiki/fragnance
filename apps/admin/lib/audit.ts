import type { SupabaseClient } from "@supabase/supabase-js";
import { getUser } from "./auth";

// Resolves the logged-in Supabase Auth session back to its admin_users row,
// so every write route can attribute audit_logs/order_events to a real admin
// instead of leaving admin_user_id null (§26 requires "Admin: [NAME]").
export async function resolveAdminUserId(client: SupabaseClient): Promise<string | null> {
  const authUser = await getUser();
  if (!authUser) return null;
  const { data } = await client
    .from("admin_users")
    .select("id")
    .eq("supabase_auth_id", authUser.id)
    .maybeSingle();
  return (data?.id as string) ?? null;
}

export async function logAudit(
  client: SupabaseClient,
  entry: {
    adminUserId: string | null;
    action: string;
    entityType: string;
    entityId?: string | null;
    oldValue?: unknown;
    newValue?: unknown;
    reason?: string | null;
  },
): Promise<void> {
  await client.from("audit_logs").insert({
    admin_user_id: entry.adminUserId,
    action: entry.action,
    entity_type: entry.entityType,
    entity_id: entry.entityId ?? null,
    old_value: entry.oldValue ?? null,
    new_value: entry.newValue ?? null,
    reason: entry.reason ?? null,
  });
}
