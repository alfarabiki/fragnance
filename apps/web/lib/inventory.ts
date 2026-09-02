import type { SupabaseClient } from "@supabase/supabase-js";

export type InventoryItemType = "BOTTLE" | "PACKAGING";

export interface StockLine {
  itemType: InventoryItemType;
  itemId: string;
  qty: number;
}

// Pure: collapse per-order-item bottle/packaging usage into deduped stock
// lines (same bottle used twice in one order = one line, qty summed).
export function reservationLines(
  items: Array<{ bottleId: string | null; packagingId: string | null; quantity: number }>,
): StockLine[] {
  const map = new Map<string, StockLine>();
  const add = (itemType: InventoryItemType, itemId: string | null, qty: number) => {
    if (!itemId) return; // unresolved catalog→DB id — skip rather than corrupt stock counts
    const key = `${itemType}:${itemId}`;
    const existing = map.get(key);
    if (existing) existing.qty += qty;
    else map.set(key, { itemType, itemId, qty });
  };
  for (const item of items) {
    add("BOTTLE", item.bottleId, item.quantity);
    add("PACKAGING", item.packagingId, item.quantity);
  }
  return [...map.values()];
}

// Reserve stock for a new order (§55 RESERVATION). Best-effort: logs and
// continues on a single line's failure rather than failing order creation —
// inventory is a secondary concern to the order itself existing.
export async function reserveStock(db: SupabaseClient, orderId: string, lines: StockLine[]): Promise<void> {
  for (const line of lines) {
    try {
      const { data: existing } = await db
        .from("inventory_items")
        .select("id, reserved_stock")
        .eq("item_type", line.itemType)
        .eq("item_id", line.itemId)
        .maybeSingle();

      if (existing) {
        await db
          .from("inventory_items")
          .update({ reserved_stock: existing.reserved_stock + line.qty })
          .eq("id", existing.id);
      } else {
        await db.from("inventory_items").insert({
          item_type: line.itemType,
          item_id: line.itemId,
          current_stock: 0,
          reserved_stock: line.qty,
        });
      }

      await db.from("inventory_movements").insert({
        item_type: line.itemType,
        item_id: line.itemId,
        movement_type: "RESERVATION",
        qty: -line.qty,
        reference_order_id: orderId,
        note: "Reserved at order creation",
      });
    } catch (err) {
      console.error("[inventory] reserve failed", line, err);
    }
  }
}

// Turn an order's RESERVATION movements into a SALE (payment confirmed) or
// release them (CANCELLATION — expired/cancelled order). Reads the qty back
// from the RESERVATION rows themselves rather than re-deriving from
// order_items/order_customizations, since those two tables don't share a
// join key back to a specific line (order_customizations has no quantity or
// order_item_id column).
export async function convertReservation(
  db: SupabaseClient,
  orderId: string,
  toStatus: "SALE" | "CANCELLATION",
): Promise<void> {
  const { data: reservations } = await db
    .from("inventory_movements")
    .select("item_type, item_id, qty")
    .eq("reference_order_id", orderId)
    .eq("movement_type", "RESERVATION");
  if (!reservations?.length) return;

  const totals = new Map<string, { itemType: string; itemId: string; qty: number }>();
  for (const r of reservations) {
    const qty = Math.abs(r.qty);
    const key = `${r.item_type}:${r.item_id}`;
    const existing = totals.get(key);
    if (existing) existing.qty += qty;
    else totals.set(key, { itemType: r.item_type, itemId: r.item_id, qty });
  }

  for (const line of totals.values()) {
    try {
      const { data: existing } = await db
        .from("inventory_items")
        .select("id, current_stock, reserved_stock")
        .eq("item_type", line.itemType)
        .eq("item_id", line.itemId)
        .maybeSingle();
      if (!existing) continue;

      const nextReserved = Math.max(0, existing.reserved_stock - line.qty);
      const nextCurrent =
        toStatus === "SALE" ? Math.max(0, existing.current_stock - line.qty) : existing.current_stock;
      await db
        .from("inventory_items")
        .update({ reserved_stock: nextReserved, current_stock: nextCurrent })
        .eq("id", existing.id);

      await db.from("inventory_movements").insert({
        item_type: line.itemType,
        item_id: line.itemId,
        movement_type: toStatus,
        qty: toStatus === "SALE" ? -line.qty : line.qty,
        reference_order_id: orderId,
        note: toStatus === "SALE" ? "Payment confirmed" : "Reservation released",
      });
    } catch (err) {
      console.error("[inventory] convert failed", line, err);
    }
  }
}
