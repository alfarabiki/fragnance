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

function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "packaging"
  );
}

interface CreateBody {
  name: string;
  description?: string;
  costPrice?: number;
  sellPrice?: number;
  isMandatory?: boolean;
  currentStock?: number;
}

export async function POST(req: Request) {
  const client = db();
  if (!client) {
    return NextResponse.json({ error: { message: "Database belum terhubung." } }, { status: 501 });
  }

  const body = (await req.json()) as CreateBody;
  if (!body.name?.trim()) {
    return NextResponse.json({ error: { message: "Nama packaging wajib diisi." } }, { status: 400 });
  }

  const base = slugify(body.name);
  let slug = base;
  for (let attempt = 0; attempt < 5; attempt++) {
    const { data: clash } = await client.from("packaging").select("id").eq("slug", slug).maybeSingle();
    if (!clash) break;
    slug = `${base}-${Math.random().toString(36).slice(2, 6)}`;
  }

  const { data: pack, error } = await client
    .from("packaging")
    .insert({
      slug,
      name: body.name.trim(),
      description: body.description ?? null,
      cost_price: body.costPrice ?? 0,
      sell_price: body.sellPrice ?? 0,
      is_mandatory: body.isMandatory ?? false,
      is_active: true,
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: { message: error.message } }, { status: 500 });
  }

  const { error: stockErr } = await upsertStock(client, "PACKAGING", pack.id, body.currentStock ?? 0);
  if (stockErr) {
    return NextResponse.json(
      { error: { message: `Packaging dibuat, tapi stok gagal disimpan: ${stockErr}` } },
      { status: 500 },
    );
  }

  await revalidateWeb();

  return NextResponse.json({ ok: true, packaging: { ...pack, current_stock: body.currentStock ?? 0 } });
}
