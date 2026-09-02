import type { SupabaseClient } from "@supabase/supabase-js";

// Server-side counterpart to lib/analytics.ts's track() — used where the
// event originates from a route handler (order created, payment confirmed)
// rather than a client click. Never throws into the caller.
export async function trackServer(
  db: SupabaseClient,
  eventType: string,
  opts: { orderId?: string | null; customerId?: string | null; metadata?: Record<string, unknown> } = {},
): Promise<void> {
  try {
    await db.from("analytics_events").insert({
      event_type: eventType,
      order_id: opts.orderId ?? null,
      customer_id: opts.customerId ?? null,
      metadata: opts.metadata ?? null,
    });
  } catch (err) {
    console.error("[analytics] track failed", eventType, err);
  }
}
