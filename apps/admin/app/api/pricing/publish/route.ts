import { NextResponse } from "next/server";
import { createClient as createSupabase } from "@supabase/supabase-js";
import { resolveAdminUserId, logAudit } from "@/lib/audit";
import { revalidateWeb } from "@/lib/revalidate-web";
import { nextLabel } from "@/lib/pricing-version";

function db() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createSupabase(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

interface Row {
  fragranceId: string;
  costPerMl: number;
  pricePerMl: number;
}

interface Body {
  rows: Row[];
}

// Publish (§25 DRAFT → PREVIEW → PUBLISH): creates a NEW pricing_versions
// row, moves the previous ACTIVE version to PUBLISHED (kept for history —
// order snapshots reference pricing_version_label, never get rewritten), and
// re-points every fragrance's active fragrance_pricing row at the new
// version. This is the real backing for pricing-tier-editor's Publish button
// (previously local React state only — nothing persisted).
export async function POST(req: Request) {
  const client = db();
  if (!client) {
    return NextResponse.json({ error: { message: "Database belum terhubung." } }, { status: 501 });
  }

  const body = (await req.json()) as Body;
  if (!body.rows?.length) {
    return NextResponse.json({ error: { message: "Tidak ada data harga untuk dipublish." } }, { status: 400 });
  }

  const { data: activeVersion } = await client
    .from("pricing_versions")
    .select("id, label")
    .eq("status", "ACTIVE")
    .maybeSingle();

  const label = nextLabel(activeVersion?.label ?? null);

  if (activeVersion) {
    await client.from("pricing_versions").update({ status: "PUBLISHED" }).eq("id", activeVersion.id);
  }

  const { data: newVersion, error: versionErr } = await client
    .from("pricing_versions")
    .insert({ label, status: "ACTIVE", published_at: new Date().toISOString() })
    .select("id, label")
    .single();
  if (versionErr) {
    return NextResponse.json({ error: { message: versionErr.message } }, { status: 500 });
  }

  await client
    .from("fragrance_pricing")
    .update({ active: false })
    .in("fragrance_id", body.rows.map((r) => r.fragranceId));

  const { error: insertErr } = await client.from("fragrance_pricing").insert(
    body.rows.map((r) => ({
      fragrance_id: r.fragranceId,
      version_id: newVersion.id,
      cost_per_ml: r.costPerMl,
      price_per_ml: r.pricePerMl,
      active: true,
    })),
  );
  if (insertErr) {
    return NextResponse.json({ error: { message: insertErr.message } }, { status: 500 });
  }

  const adminUserId = await resolveAdminUserId(client);
  await logAudit(client, {
    adminUserId,
    action: "PRICING_PUBLISHED",
    entityType: "pricing_version",
    entityId: newVersion.label,
    oldValue: activeVersion ? { label: activeVersion.label } : null,
    newValue: { label: newVersion.label, fragranceCount: body.rows.length },
  });

  await revalidateWeb();

  return NextResponse.json({ ok: true, version: newVersion });
}
