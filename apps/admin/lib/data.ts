import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { fragrances, bottles, packaging } from "@atlase/config";

type Row = Record<string, unknown>;

function configured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

async function adminClient() {
  const cookieStore = await cookies();
  return createServerClient<Record<string, never>>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: { maxAge?: number; path?: string }) {
          cookieStore.set(name, value, options);
        },
        remove(name: string, options: { maxAge?: number; path?: string }) {
          cookieStore.set(name, "", options);
        },
      },
    },
  );
}

export type OrderRow = {
  id: string;
  order_number: string;
  customer_id: string | null;
  channel: string | null;
  status: string | null;
  total: number | null;
  created_at: string | null;
};

export async function listOrders(): Promise<OrderRow[]> {
  if (!configured()) return [];
  const db = await adminClient();
  const { data, error } = await db
    .from("orders")
    .select("id, order_number, customer_id, channel, status, total, created_at")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) return [];
  return (data as unknown as OrderRow[]) ?? [];
}

export async function listFragrances(): Promise<Row[]> {
  if (!configured()) {
    return fragrances.map((f) => ({
      id: f.id,
      name: f.name,
      description: f.description,
      category: f.category,
      cost_per_ml: f.costPerMl,
      price_per_ml: f.pricePerMl,
      min_ml: f.minMl,
      max_ml: f.maxMl,
      is_active: f.isActive,
      image_url: null,
      video_url: null,
    }));
  }
  const db = await adminClient();
  const { data, error } = await db.from("fragrances").select("*").order("name");
  if (error) return [];

  // cost/price live in fragrance_pricing (versioned, §17), not on the
  // fragrances row itself — select("*") alone silently returns rows with no
  // price at all. Join in the ACTIVE version's numbers.
  const { data: pricingRaw } = await db
    .from("fragrance_pricing")
    .select("fragrance_id, cost_per_ml, price_per_ml")
    .eq("active", true);
  const pricing = (pricingRaw as unknown as Row[]) ?? [];
  const priceByFragrance = new Map(pricing.map((p) => [p.fragrance_id as string, p]));

  return ((data as unknown as Row[]) ?? []).map((f) => ({
    ...f,
    cost_per_ml: priceByFragrance.get(f.id as string)?.cost_per_ml ?? 0,
    price_per_ml: priceByFragrance.get(f.id as string)?.price_per_ml ?? 0,
  }));
}

async function stockByItemId(db: Awaited<ReturnType<typeof adminClient>>, itemType: string): Promise<Map<string, number>> {
  const { data } = await db
    .from("inventory_items")
    .select("item_id, current_stock")
    .eq("item_type", itemType);
  const rows = (data as unknown as Row[]) ?? [];
  return new Map(rows.map((r) => [r.item_id as string, Number(r.current_stock)]));
}

export async function listBottles(): Promise<Row[]> {
  if (!configured()) {
    return bottles.map((b) => ({
      id: b.id,
      name: b.name,
      volume_ml: b.volumeMl,
      cost_price: b.costPrice,
      sell_price: b.sellPrice,
      is_active: b.isActive,
      current_stock: 0,
    }));
  }
  const db = await adminClient();
  const [{ data, error }, stock] = await Promise.all([
    db.from("bottles").select("*").order("volume_ml"),
    stockByItemId(db, "BOTTLE"),
  ]);
  if (error) return [];
  return ((data as unknown as Row[]) ?? []).map((b) => ({
    ...b,
    current_stock: stock.get(b.id as string) ?? 0,
  }));
}

export async function listPackaging(): Promise<Row[]> {
  if (!configured()) {
    return packaging.map((p) => ({
      id: p.id,
      name: p.name,
      cost_price: p.costPrice,
      sell_price: p.sellPrice,
      is_mandatory: p.isMandatory,
      is_active: p.isActive,
      current_stock: 0,
    }));
  }
  const db = await adminClient();
  const [{ data, error }, stock] = await Promise.all([
    db.from("packaging").select("*"),
    stockByItemId(db, "PACKAGING"),
  ]);
  if (error) return [];
  return ((data as unknown as Row[]) ?? []).map((p) => ({
    ...p,
    current_stock: stock.get(p.id as string) ?? 0,
  }));
}