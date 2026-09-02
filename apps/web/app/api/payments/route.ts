import { NextResponse } from "next/server";
import { createClient as createSupabase } from "@supabase/supabase-js";

// Create a Midtrans QRIS transaction for an order, server-side only.
// Server key lives ONLY on the backend (never exposed to client).

const SERVER_KEY = process.env.MIDTRANS_SERVER_KEY;
const IS_SANDBOX = process.env.MIDTRANS_IS_SANDBOX === "true";
const BASE = IS_SANDBOX ? "https://app.sandbox.midtrans.com" : "https://app.midtrans.com";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { orderId?: string; orderNumber?: string; amount?: number };

    if (!body?.orderNumber || typeof body.amount !== "number") {
      return NextResponse.json({ error: { message: "Order atau jumlah tidak valid." } }, { status: 400 });
    }
    if (!SERVER_KEY) {
      return NextResponse.json({ error: { message: "Midtrans belum dikonfigurasi." } }, { status: 501 });
    }

    // Persist transaction details idempotently to Supabase if order exists
    if (body.orderId && process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const db = createSupabase(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
        auth: { autoRefreshToken: false, persistSession: false },
      });
      const { data: payments } = await db
        .from("payments")
        .select("id")
        .eq("order_id", body.orderId)
        .limit(1);
      await db.from("payment_transactions").insert({
        payment_id: payments?.[0]?.id ?? null,
        idempotency_key: body.orderNumber,
        status: "PENDING",
        amount: body.amount,
      });
    }

    const auth = Buffer.from(SERVER_KEY + ":").toString("base64");
    const res = await fetch(`${BASE}/snap/v1/transactions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({
        transaction_details: {
          order_id: body.orderNumber,
          gross_amount: body.amount,
        },
        payment_type: "qris",
        qris: {},
        customer_details: {
          first_name: "Pembeli",
        },
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json({ error: { message: "Pembayaran gagal dibuat." } }, { status: res.status });
    }

    return NextResponse.json({ ok: true, transaction: data }, { status: 201 });
  } catch (err) {
    console.error("[api/payments] error", err);
    return NextResponse.json({ error: { message: "Pembayaran belum bisa dibuat. Silakan coba lagi." } }, { status: 500 });
  }
}