import { NextResponse } from "next/server";
import { createClient as createSupabase } from "@supabase/supabase-js";
import { resolveAdminUserId, logAudit } from "@/lib/audit";
import { revalidateWeb } from "@/lib/revalidate-web";

function db() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createSupabase(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

interface UpdateBody {
  name?: string;
  value?: number;
  minOrder?: number;
  isActive?: boolean;
  startsAt?: string | null;
  endsAt?: string | null;
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = db();
  if (!client) {
    return NextResponse.json({ error: { message: "Database belum terhubung." } }, { status: 501 });
  }

  const body = (await req.json()) as UpdateBody;
  const fields: Record<string, unknown> = {};
  if (body.name !== undefined) fields.name = body.name;
  if (body.value !== undefined) fields.value = body.value;
  if (body.minOrder !== undefined) fields.min_order = body.minOrder;
  if (body.isActive !== undefined) fields.is_active = body.isActive;
  if (body.startsAt !== undefined) fields.starts_at = body.startsAt;
  if (body.endsAt !== undefined) fields.ends_at = body.endsAt;

  const { data: before } = await client.from("promotions").select("*").eq("id", id).maybeSingle();

  const { error } = await client.from("promotions").update(fields).eq("id", id);
  if (error) {
    return NextResponse.json({ error: { message: error.message } }, { status: 500 });
  }

  const adminUserId = await resolveAdminUserId(client);
  await logAudit(client, {
    adminUserId,
    action: "PROMOTION_UPDATED",
    entityType: "promotion",
    entityId: id,
    oldValue: before,
    newValue: fields,
  });
  await revalidateWeb();

  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = db();
  if (!client) {
    return NextResponse.json({ error: { message: "Database belum terhubung." } }, { status: 501 });
  }

  const { data: before } = await client.from("promotions").select("*").eq("id", id).maybeSingle();

  const { error } = await client.from("promotions").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: { message: error.message } }, { status: 500 });
  }

  const adminUserId = await resolveAdminUserId(client);
  await logAudit(client, {
    adminUserId,
    action: "PROMOTION_DELETED",
    entityType: "promotion",
    entityId: id,
    oldValue: before,
  });
  await revalidateWeb();

  return NextResponse.json({ ok: true });
}
