import { NextResponse } from "next/server";
import { createClient as createSupabase } from "@supabase/supabase-js";
import { getOrCreateActivePricingVersion } from "@/lib/pricing-version";
import { revalidateWeb } from "@/lib/revalidate-web";

// Same service-role write path as [id]/route.ts — RLS denies writes by
// default, so catalog creation only happens server-side here.
function db() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createSupabase(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "aroma";
}

interface CreateBody {
  name: string;
  description?: string;
  category?: string;
  minMl?: number;
  maxMl?: number;
  pricePerMl?: number;
  costPerMl?: number;
}

export async function POST(req: Request) {
  const client = db();
  if (!client) {
    return NextResponse.json({ error: { message: "Database belum terhubung." } }, { status: 501 });
  }

  const body = (await req.json()) as CreateBody;
  if (!body.name?.trim()) {
    return NextResponse.json({ error: { message: "Nama aroma wajib diisi." } }, { status: 400 });
  }

  // Slugs are unique — append a short suffix on collision instead of failing.
  const base = slugify(body.name);
  let slug = base;
  for (let attempt = 0; attempt < 5; attempt++) {
    const { data: clash } = await client.from("fragrances").select("id").eq("slug", slug).maybeSingle();
    if (!clash) break;
    slug = `${base}-${Math.random().toString(36).slice(2, 6)}`;
  }

  const { data: fragrance, error } = await client
    .from("fragrances")
    .insert({
      slug,
      name: body.name.trim(),
      description: body.description ?? null,
      category: body.category ?? null,
      min_ml: body.minMl ?? 5,
      max_ml: body.maxMl ?? 50,
      is_active: true,
    })
    .select("id, slug, name, description, category, min_ml, max_ml, is_active, image_url, video_url")
    .single();

  if (error) {
    return NextResponse.json({ error: { message: error.message } }, { status: 500 });
  }

  try {
    const versionId = await getOrCreateActivePricingVersion(client);
    const { error: pricingError } = await client.from("fragrance_pricing").insert({
      fragrance_id: fragrance.id,
      version_id: versionId,
      cost_per_ml: body.costPerMl ?? 0,
      price_per_ml: body.pricePerMl ?? 0,
      active: true,
    });
    if (pricingError) throw new Error(pricingError.message);
  } catch (e) {
    // Fragrance row exists but pricing failed — surface it, the admin can
    // retry pricing via the normal Save button (PATCH upserts pricing).
    return NextResponse.json(
      { error: { message: `Aroma dibuat, tapi harga gagal disimpan: ${(e as Error).message}` } },
      { status: 500 },
    );
  }

  await revalidateWeb();

  return NextResponse.json({
    ok: true,
    fragrance: {
      ...fragrance,
      cost_per_ml: body.costPerMl ?? 0,
      price_per_ml: body.pricePerMl ?? 0,
    },
  });
}
