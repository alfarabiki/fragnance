import { NextResponse } from "next/server";
import { createClient as createSupabase } from "@supabase/supabase-js";
import { rateLimit, clientIp, isCrossOrigin } from "@/lib/security";

const ALLOWED_EVENTS = new Set([
  "add_to_cart",
  "checkout_started",
  "whatsapp_clicked",
  "order_created",
  "payment_started",
  "payment_success",
  "payment_failed",
]);

export async function POST(req: Request) {
  try {
    if (isCrossOrigin(req)) {
      return NextResponse.json({ ok: false }, { status: 403 });
    }
    // Generous limit — this fires on routine clicks, not just form submits.
    if (!rateLimit(`analytics:${clientIp(req)}`, { max: 60, windowMs: 60_000 })) {
      return NextResponse.json({ ok: false }, { status: 429 });
    }

    const body = (await req.json()) as { eventType?: string; sessionId?: string; metadata?: unknown };
    if (!body.eventType || !ALLOWED_EVENTS.has(body.eventType)) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (url && key) {
      const db = createSupabase(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
      await db.from("analytics_events").insert({
        event_type: body.eventType,
        session_id: body.sessionId ?? null,
        metadata: body.metadata ?? null,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/analytics/track] error", err);
    // Analytics failures must never surface to the customer.
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
