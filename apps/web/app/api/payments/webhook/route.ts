import { NextResponse } from "next/server";
import { createClient as createSupabase } from "@supabase/supabase-js";
import { verifyMidtransSignature } from "@/lib/midtrans";
import { convertReservation } from "@/lib/inventory";
import { trackServer } from "@/lib/analytics-server";

// Midtrans notification webhook.
//  1. receive notification
//  2. validate authenticity (SHA512 signature)
//  3. verify order + amount
//  4. update payment and order state idempotently
//  5. persist payment event

const SERVER_KEY = process.env.MIDTRANS_SERVER_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function POST(req: Request) {
  try {
    const payload = (await req.json()) as Record<string, string | number>;

    if (!SERVER_KEY || !SUPABASE_URL || !SERVICE_KEY) {
      return NextResponse.json({ error: "Payment not configured" }, { status: 501 });
    }

    // 1-2. Authenticity
    if (!verifyMidtransSignature(payload, SERVER_KEY)) {
      await logWebhook(payload, false, "SIGNATURE_MISMATCH");
      return NextResponse.json({ error: "Bad signature" }, { status: 401 });
    }

    const db = createSupabase(SUPABASE_URL, SERVICE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // 3. Identify order + payment
    const orderNumber = String(payload.order_id ?? "");
    const { data: order } = await db
      .from("orders")
      .select("id, order_number, total, status")
      .eq("order_number", orderNumber)
      .single();

    if (!order) {
      await logWebhook(payload, true, "ORDER_NOT_FOUND");
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const { data: payment } = await db
      .from("payments")
      .select("*")
      .eq("order_id", order.id)
      .limit(1)
      .maybeSingle();

    // 4. Verify amount (cents → rupiah; Midtrans gross_amount matches order.total)
    const grossAmount = Number(payload.gross_amount ?? 0);
    if (payment && grossAmount !== payment.amount_requested) {
      await logWebhook(payload, true, "AMOUNT_MISMATCH");
      return NextResponse.json({ error: "Amount mismatch" }, { status: 409 });
    }

    // 5. Map Midtrans status to our enum (idempotent)
    const statusCode = String(payload.status_code ?? "");
    const transactionStatus = String(payload.transaction_status ?? "");
    const midtransOk = ["200", "201", "202"].includes(statusCode);
    const isPaid =
      midtransOk && ["capture", "settlement", "success", "accepted"].includes(transactionStatus);
    const isExpired = ["expire", "cancel", "deny"].includes(transactionStatus);

    let fromStatus = payment?.status ?? "PENDING";
    let toStatus = payment?.status ?? "PENDING";
    if (isPaid) toStatus = "PAID";
    else if (isExpired) toStatus = "EXPIRED";

    // 6. Idempotent update (only move forward)
    if (payment && toStatus !== fromStatus) {
      await db.from("payments").update({ status: toStatus, amount_paid: isPaid ? grossAmount : null, updated_at: new Date().toISOString() }).eq("id", payment.id);

      // 7. Update order state machine
      if (isPaid && (order.status === "PENDING_PAYMENT" || order.status === "DRAFT" || order.status === "CONFIRMED")) {
        await db.from("orders").update({ status: "PAID", payment_status: "PAID" }).eq("id", order.id);
        await db.from("order_events").insert({
          order_id: order.id,
          event_type: "payment_received",
          from_status: order.status,
          to_status: "PAID",
          note: "Pembayaran dikonfirmasi webhook",
        });
        await convertReservation(db, order.id, "SALE");
        await trackServer(db, "payment_success", { orderId: order.id, metadata: { transactionStatus } });
      } else if (isExpired) {
        await convertReservation(db, order.id, "CANCELLATION");
        await trackServer(db, "payment_failed", { orderId: order.id, metadata: { transactionStatus } });
      }
    }

    // 8. Persist event
    await db.from("payment_events").insert({
      payment_id: payment?.id ?? null,
      event_type: isPaid ? "SUCCESS" : isExpired ? "EXPIRY" : "NOTIFICATION",
      raw_payload: payload,
      verified: true,
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("[api/payments/webhook] error", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

async function logWebhook(
  payload: Record<string, string | number>,
  verified: boolean,
  note?: string,
) {
  if (!SUPABASE_URL || !SERVICE_KEY) return;
  const db = createSupabase(SUPABASE_URL, SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  await db.from("payment_events").insert({
    event_type: "NOTIFICATION",
    raw_payload: note ? { ...payload, _note: note } : payload,
    verified,
    received_at: new Date().toISOString(),
  });
}