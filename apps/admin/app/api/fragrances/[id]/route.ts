import { NextResponse } from "next/server";
import { createClient as createSupabase } from "@supabase/supabase-js";

// Admin-only writes to the catalog. Middleware already gates every route
// behind a logged-in Supabase session (see apps/admin/middleware.ts); this
// uses the service-role key server-side so it can write past the
// deny-by-default RLS on fragrances/fragrance_pricing (§51 — writes are
// service-role only, never exposed to the client).

function db() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createSupabase(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

interface UpdateBody {
  name?: string;
  description?: string;
  category?: string;
  minMl?: number;
  maxMl?: number;
  isActive?: boolean;
  pricePerMl?: number;
  costPerMl?: number;
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
  if (body.description !== undefined) fields.description = body.description;
  if (body.category !== undefined) fields.category = body.category;
  if (body.minMl !== undefined) fields.min_ml = body.minMl;
  if (body.maxMl !== undefined) fields.max_ml = body.maxMl;
  if (body.isActive !== undefined) fields.is_active = body.isActive;

  if (Object.keys(fields).length > 0) {
    const { error } = await client.from("fragrances").update(fields).eq("id", id);
    if (error) {
      return NextResponse.json({ error: { message: error.message } }, { status: 500 });
    }
  }

  // Price/cost live in fragrance_pricing, versioned (§17/§18). MVP keeps a
  // single "current" ACTIVE version instead of a full draft/preview/publish
  // flow — get-or-create it, then upsert this fragrance's row under it.
  // ponytail: no draft/publish UI yet; add when multiple staged price
  // changes actually need to be reviewed before going live.
  if (body.pricePerMl !== undefined || body.costPerMl !== undefined) {
    let { data: version } = await client
      .from("pricing_versions")
      .select("id")
      .eq("status", "ACTIVE")
      .limit(1)
      .maybeSingle();

    if (!version) {
      const { data: created, error: versionErr } = await client
        .from("pricing_versions")
        .insert({ label: "v1.0", status: "ACTIVE", published_at: new Date().toISOString() })
        .select("id")
        .single();
      if (versionErr) {
        return NextResponse.json({ error: { message: versionErr.message } }, { status: 500 });
      }
      version = created;
    }

    const { data: existingRow } = await client
      .from("fragrance_pricing")
      .select("id, cost_per_ml, price_per_ml")
      .eq("fragrance_id", id)
      .eq("version_id", version!.id)
      .maybeSingle();

    const costPerMl = body.costPerMl ?? existingRow?.cost_per_ml ?? 0;
    const pricePerMl = body.pricePerMl ?? existingRow?.price_per_ml ?? 0;

    if (existingRow) {
      const { error } = await client
        .from("fragrance_pricing")
        .update({ cost_per_ml: costPerMl, price_per_ml: pricePerMl, active: true })
        .eq("id", existingRow.id);
      if (error) return NextResponse.json({ error: { message: error.message } }, { status: 500 });
    } else {
      const { error } = await client.from("fragrance_pricing").insert({
        fragrance_id: id,
        version_id: version!.id,
        cost_per_ml: costPerMl,
        price_per_ml: pricePerMl,
        active: true,
      });
      if (error) return NextResponse.json({ error: { message: error.message } }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}
