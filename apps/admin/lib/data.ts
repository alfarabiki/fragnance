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
      category: f.category,
      cost_per_ml: f.costPerMl,
      price_per_ml: f.pricePerMl,
      min_ml: f.minMl,
      max_ml: f.maxMl,
      is_active: f.isActive,
    }));
  }
  const db = await adminClient();
  const { data, error } = await db.from("fragrances").select("*");
  if (error) return [];
  return (data as unknown as Row[]) ?? [];
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
    }));
  }
  const db = await adminClient();
  const { data, error } = await db.from("bottles").select("*");
  if (error) return [];
  return (data as unknown as Row[]) ?? [];
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
    }));
  }
  const db = await adminClient();
  const { data, error } = await db.from("packaging").select("*");
  if (error) return [];
  return (data as unknown as Row[]) ?? [];
}