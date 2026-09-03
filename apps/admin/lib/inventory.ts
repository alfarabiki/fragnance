import type { SupabaseClient } from "@supabase/supabase-js";

export async function upsertStock(
  client: SupabaseClient,
  itemType: "BOTTLE" | "PACKAGING" | "FRAGRANCE",
  itemId: string,
  currentStock: number,
): Promise<{ error: string | null }> {
  const { error } = await client
    .from("inventory_items")
    .upsert({ item_type: itemType, item_id: itemId, current_stock: currentStock }, { onConflict: "item_type,item_id" });
  return { error: error?.message ?? null };
}
