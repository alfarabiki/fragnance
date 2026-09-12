import type { SupabaseClient } from "@supabase/supabase-js";

// MVP keeps a single "current" ACTIVE pricing version instead of a full
// draft/preview/publish flow (§25) — get-or-create it once, reused by every
// route that writes fragrance_pricing/bottle pricing/packaging pricing.
export async function getOrCreateActivePricingVersion(client: SupabaseClient): Promise<string> {
  const { data: version } = await client
    .from("pricing_versions")
    .select("id")
    .eq("status", "ACTIVE")
    .limit(1)
    .maybeSingle();

  if (version) return version.id as string;

  const { data: created, error } = await client
    .from("pricing_versions")
    .insert({ label: "v1.0", status: "ACTIVE", published_at: new Date().toISOString() })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  return created.id as string;
}

// v1.0 -> v1.1 -> v1.2 ... used by /api/pricing/publish to name each new
// pricing_versions row. No prior version (fresh DB, nothing published yet)
// starts at v1.0; an unparseable label also falls back to v1.0 rather than
// blocking the publish.
export function nextLabel(current: string | null): string {
  if (!current) return "v1.0";
  const n = parseFloat(current.replace(/^v/i, ""));
  if (!Number.isFinite(n)) return "v1.0";
  return `v${(Math.round((n + 0.1) * 10) / 10).toFixed(1)}`;
}
