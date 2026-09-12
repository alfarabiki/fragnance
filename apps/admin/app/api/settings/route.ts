import { NextResponse } from "next/server";
import { createClient as createSupabase } from "@supabase/supabase-js";
import { resolveAdminUserId, logAudit } from "@/lib/audit";

function db() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createSupabase(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

interface Body {
  key: string;
  value: unknown;
}

// system_settings is a flat key/value store (§46 comment: "alcohol & shipping
// base cost"). Every write is audit-logged with the old value (§26) since
// these numbers feed the pricing engine directly.
export async function PATCH(req: Request) {
  const client = db();
  if (!client) {
    return NextResponse.json({ error: { message: "Database belum terhubung." } }, { status: 501 });
  }

  const body = (await req.json()) as Body;
  if (!body.key?.trim()) {
    return NextResponse.json({ error: { message: "Key wajib diisi." } }, { status: 400 });
  }

  const { data: existing } = await client.from("system_settings").select("value").eq("key", body.key).maybeSingle();

  const adminUserId = await resolveAdminUserId(client);

  const { error } = await client
    .from("system_settings")
    .upsert({ key: body.key, value: body.value, updated_by: adminUserId, updated_at: new Date().toISOString() });
  if (error) {
    return NextResponse.json({ error: { message: error.message } }, { status: 500 });
  }

  await logAudit(client, {
    adminUserId,
    action: "SETTING_CHANGED",
    entityType: "system_settings",
    entityId: body.key,
    oldValue: existing?.value ?? null,
    newValue: body.value,
  });

  return NextResponse.json({ ok: true });
}
