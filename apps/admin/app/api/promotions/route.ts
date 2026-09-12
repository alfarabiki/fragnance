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

interface CreateBody {
  name: string;
  type: "PERCENTAGE" | "FIXED";
  value: number;
  minOrder?: number;
  targetFragranceId?: string | null;
  targetBottleId?: string | null;
  targetVolumeMl?: number | null;
  customerSegment?: string | null;
  couponCode?: string | null;
  startsAt?: string | null;
  endsAt?: string | null;
}

export async function GET() {
  const client = db();
  if (!client) return NextResponse.json({ promotions: [] });
  const { data, error } = await client.from("promotions").select("*").order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: { message: error.message } }, { status: 500 });
  return NextResponse.json({ promotions: data ?? [] });
}

export async function POST(req: Request) {
  const client = db();
  if (!client) {
    return NextResponse.json({ error: { message: "Database belum terhubung." } }, { status: 501 });
  }

  const body = (await req.json()) as CreateBody;
  if (!body.name?.trim()) {
    return NextResponse.json({ error: { message: "Nama promo wajib diisi." } }, { status: 400 });
  }
  if (body.type !== "PERCENTAGE" && body.type !== "FIXED") {
    return NextResponse.json({ error: { message: "Tipe promo tidak valid." } }, { status: 400 });
  }
  if (!body.value || body.value <= 0) {
    return NextResponse.json({ error: { message: "Nilai promo harus lebih dari 0." } }, { status: 400 });
  }
  if (body.type === "PERCENTAGE" && body.value > 100) {
    return NextResponse.json({ error: { message: "Diskon persen maksimal 100." } }, { status: 400 });
  }

  const { data: promo, error } = await client
    .from("promotions")
    .insert({
      name: body.name.trim(),
      type: body.type,
      value: body.value,
      min_order: body.minOrder ?? 0,
      target_fragrance_id: body.targetFragranceId ?? null,
      target_bottle_id: body.targetBottleId ?? null,
      target_volume_ml: body.targetVolumeMl ?? null,
      customer_segment: body.customerSegment ?? null,
      coupon_code: body.couponCode?.trim().toUpperCase() || null,
      starts_at: body.startsAt ?? null,
      ends_at: body.endsAt ?? null,
      is_active: true,
    })
    .select("*")
    .single();

  if (error) {
    const message = error.code === "23505" ? "Kode kupon sudah dipakai." : error.message;
    return NextResponse.json({ error: { message } }, { status: 500 });
  }

  const adminUserId = await resolveAdminUserId(client);
  await logAudit(client, {
    adminUserId,
    action: "PROMOTION_CREATED",
    entityType: "promotion",
    entityId: promo.id,
    newValue: promo,
  });
  await revalidateWeb();

  return NextResponse.json({ ok: true, promotion: promo });
}
