import { NextResponse } from "next/server";
import { createClient as createSupabase } from "@supabase/supabase-js";

// Read-only order/payment status, polled by the QRIS payment page.
// Status is only ever written by the Midtrans webhook (server-verified) —
// this endpoint never lets a client set its own "paid" state (§7).

export async function GET(_req: Request, { params }: { params: Promise<{ orderNumber: string }> }) {
  const { orderNumber } = await params;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return NextResponse.json({ error: { message: "Belum terhubung ke database." } }, { status: 501 });
  }

  const db = createSupabase(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data: order } = await db
    .from("orders")
    .select("id, status")
    .eq("order_number", orderNumber)
    .maybeSingle();

  if (!order) {
    return NextResponse.json({ error: { message: "Pesanan tidak ditemukan." } }, { status: 404 });
  }

  const { data: payment } = await db
    .from("payments")
    .select("status")
    .eq("order_id", order.id)
    .limit(1)
    .maybeSingle();

  return NextResponse.json({
    orderStatus: order.status,
    paymentStatus: payment?.status ?? "PENDING",
  });
}
