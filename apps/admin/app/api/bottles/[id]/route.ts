import { NextResponse } from "next/server";
import { createClient as createSupabase } from "@supabase/supabase-js";
import { upsertStock } from "@/lib/inventory";
import { revalidateWeb } from "@/lib/revalidate-web";

function db() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createSupabase(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

interface UpdateBody {
  name?: string;
  volumeMl?: number;
  costPrice?: number;
  sellPrice?: number;
  isActive?: boolean;
  currentStock?: number;
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
  if (body.volumeMl !== undefined) fields.volume_ml = body.volumeMl;
  if (body.costPrice !== undefined) fields.cost_price = body.costPrice;
  if (body.sellPrice !== undefined) fields.sell_price = body.sellPrice;
  if (body.isActive !== undefined) fields.is_active = body.isActive;

  if (Object.keys(fields).length > 0) {
    const { error } = await client.from("bottles").update(fields).eq("id", id);
    if (error) return NextResponse.json({ error: { message: error.message } }, { status: 500 });
  }

  if (body.currentStock !== undefined) {
    const { error } = await upsertStock(client, "BOTTLE", id, body.currentStock);
    if (error) return NextResponse.json({ error: { message: error } }, { status: 500 });
  }

  await revalidateWeb();

  return NextResponse.json({ ok: true });
}
