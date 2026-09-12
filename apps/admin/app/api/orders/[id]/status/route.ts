import { NextResponse } from "next/server";
import { createClient as createSupabase } from "@supabase/supabase-js";
import { canTransition, type OrderStatus } from "@atlase/domain";
import { resolveAdminUserId, logAudit } from "@/lib/audit";

function db() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createSupabase(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

interface Body {
  toStatus: OrderStatus;
  note?: string;
}

// Order status is a state machine (§8), never free text. Every transition is
// validated against packages/domain's ORDER_TRANSITIONS and recorded as an
// order_events row + audit_logs entry — never a silent UPDATE.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = db();
  if (!client) {
    return NextResponse.json({ error: { message: "Database belum terhubung." } }, { status: 501 });
  }

  const body = (await req.json()) as Body;
  if (!body.toStatus) {
    return NextResponse.json({ error: { message: "Status tujuan wajib diisi." } }, { status: 400 });
  }

  const { data: order, error: fetchErr } = await client
    .from("orders")
    .select("id, order_number, status, payment_status")
    .eq("id", id)
    .maybeSingle();
  if (fetchErr || !order) {
    return NextResponse.json({ error: { message: "Order tidak ditemukan." } }, { status: 404 });
  }

  const fromStatus = order.status as OrderStatus;
  if (!canTransition(fromStatus, body.toStatus)) {
    return NextResponse.json(
      { error: { message: `Tidak bisa ubah status dari ${fromStatus} ke ${body.toStatus}.` } },
      { status: 400 },
    );
  }

  const updateFields: Record<string, unknown> = { status: body.toStatus };
  if (body.toStatus === "PAID") updateFields.payment_status = "PAID";
  if (body.toStatus === "CANCELLED") updateFields.payment_status = order.payment_status ?? "FAILED";

  const { error: updateErr } = await client.from("orders").update(updateFields).eq("id", id);
  if (updateErr) {
    return NextResponse.json({ error: { message: updateErr.message } }, { status: 500 });
  }

  const adminUserId = await resolveAdminUserId(client);

  await client.from("order_events").insert({
    order_id: id,
    event_type: "STATUS_CHANGED",
    from_status: fromStatus,
    to_status: body.toStatus,
    actor_type: "ADMIN",
    actor_id: adminUserId,
    note: body.note ?? null,
  });

  await logAudit(client, {
    adminUserId,
    action: "ORDER_STATUS_CHANGED",
    entityType: "order",
    entityId: order.order_number,
    oldValue: { status: fromStatus },
    newValue: { status: body.toStatus },
    reason: body.note ?? null,
  });

  return NextResponse.json({ ok: true });
}
