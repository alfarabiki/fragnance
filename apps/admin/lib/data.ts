import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { fragrances, bottles, packaging } from "@atlase/config";
import { adminDb } from "./db";

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
  // orders has no anon/authenticated RLS policy beyond "owning customer" —
  // an admin's session never owns any order, so the old anon+cookie client
  // silently returned []. Admin reads go through the service-role client.
  const db = adminDb();
  if (!db) return [];
  const { data, error } = await db
    .from("orders")
    .select("id, order_number, customer_id, channel, status, total, created_at")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) return [];
  return (data as unknown as OrderRow[]) ?? [];
}

export type OrderDetail = OrderRow & {
  currency: string;
  subtotal: number;
  discount: number;
  shipping: number;
  payment_status: string | null;
  pricing_version_label: string | null;
  customer: { id: string; name: string | null; phone: string; email: string | null } | null;
  items: Row[];
  customizations: Row[];
  address: Row | null;
  payments: Row[];
  events: Row[];
};

export async function getOrderDetail(orderNumber: string): Promise<OrderDetail | null> {
  const db = adminDb();
  if (!db) return null;

  const { data: order } = await db.from("orders").select("*").eq("order_number", orderNumber).maybeSingle();
  if (!order) return null;

  const [{ data: customer }, { data: items }, { data: customizations }, { data: address }, { data: payments }, { data: events }] =
    await Promise.all([
      order.customer_id
        ? db.from("customers").select("id, name, phone, email").eq("id", order.customer_id).maybeSingle()
        : Promise.resolve({ data: null }),
      db.from("order_items").select("*").eq("order_id", order.id),
      db.from("order_customizations").select("*").eq("order_id", order.id),
      db.from("order_addresses").select("*").eq("order_id", order.id).maybeSingle(),
      db.from("payments").select("*").eq("order_id", order.id).order("created_at", { ascending: false }),
      db.from("order_events").select("*").eq("order_id", order.id).order("created_at", { ascending: true }),
    ]);

  return {
    id: order.id,
    order_number: order.order_number,
    customer_id: order.customer_id,
    channel: order.channel,
    status: order.status,
    total: order.total,
    created_at: order.created_at,
    currency: order.currency,
    subtotal: order.subtotal,
    discount: order.discount,
    shipping: order.shipping,
    payment_status: order.payment_status,
    pricing_version_label: order.pricing_version_label,
    customer: (customer as OrderDetail["customer"]) ?? null,
    items: (items as Row[]) ?? [],
    customizations: (customizations as Row[]) ?? [],
    address: (address as Row) ?? null,
    payments: (payments as Row[]) ?? [],
    events: (events as Row[]) ?? [],
  };
}

export async function listCustomers(): Promise<Row[]> {
  const db = adminDb();
  if (!db) return [];
  const [{ data: customers, error }, { data: orderRows }] = await Promise.all([
    db.from("customers").select("*").order("created_at", { ascending: false }).limit(200),
    db.from("orders").select("customer_id, total, created_at"),
  ]);
  if (error || !customers) return [];

  const byCustomer = new Map<string, { count: number; totalSpend: number; lastOrderAt: string }>();
  for (const o of (orderRows as Row[]) ?? []) {
    const cid = o.customer_id as string | null;
    if (!cid) continue;
    const entry = byCustomer.get(cid) ?? { count: 0, totalSpend: 0, lastOrderAt: "" };
    entry.count += 1;
    entry.totalSpend += Number(o.total ?? 0);
    const createdAt = String(o.created_at ?? "");
    if (createdAt > entry.lastOrderAt) entry.lastOrderAt = createdAt;
    byCustomer.set(cid, entry);
  }

  return (customers as Row[]).map((c) => ({
    ...c,
    order_count: byCustomer.get(c.id as string)?.count ?? 0,
    total_spend: byCustomer.get(c.id as string)?.totalSpend ?? 0,
    last_order_at: byCustomer.get(c.id as string)?.lastOrderAt || null,
  }));
}

export async function listPayments(): Promise<Row[]> {
  const db = adminDb();
  if (!db) return [];
  const [{ data: payments, error }, { data: orderRows }] = await Promise.all([
    db.from("payments").select("*").order("created_at", { ascending: false }).limit(200),
    db.from("orders").select("id, order_number"),
  ]);
  if (error || !payments) return [];
  const orderById = new Map(((orderRows as Row[]) ?? []).map((o) => [o.id as string, o.order_number as string]));
  return (payments as Row[]).map((p) => ({
    ...p,
    order_number: orderById.get(p.order_id as string) ?? null,
  }));
}

export async function listWhatsappOrders(): Promise<Row[]> {
  const db = adminDb();
  if (!db) return [];
  const [{ data: rows, error }, { data: orderRows }] = await Promise.all([
    db.from("whatsapp_orders").select("*").order("created_at", { ascending: false }).limit(200),
    db.from("orders").select("id, order_number, total"),
  ]);
  if (error || !rows) return [];
  const orderById = new Map(((orderRows as Row[]) ?? []).map((o) => [o.id as string, o]));
  return (rows as Row[]).map((w) => {
    const order = orderById.get(w.order_id as string);
    return { ...w, order_number: order?.order_number ?? null, order_total: order?.total ?? null };
  });
}

export async function listAuditLogs(): Promise<Row[]> {
  const db = adminDb();
  if (!db) return [];
  const [{ data: logs, error }, { data: admins }] = await Promise.all([
    db.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(200),
    db.from("admin_users").select("id, email, name"),
  ]);
  if (error || !logs) return [];
  const adminById = new Map(((admins as Row[]) ?? []).map((a) => [a.id as string, a]));
  return (logs as Row[]).map((l) => {
    const admin = adminById.get(l.admin_user_id as string);
    return { ...l, admin_email: admin?.email ?? null, admin_name: admin?.name ?? null };
  });
}

export async function listAdminUsers(): Promise<Row[]> {
  const db = adminDb();
  if (!db) return [];
  const [{ data: admins, error }, { data: userRoles }, { data: roles }] = await Promise.all([
    db.from("admin_users").select("*").order("created_at", { ascending: false }),
    db.from("admin_user_roles").select("admin_user_id, role_id"),
    db.from("roles").select("id, code, name"),
  ]);
  if (error || !admins) return [];
  const roleById = new Map(((roles as Row[]) ?? []).map((r) => [r.id as string, r]));
  const rolesByAdmin = new Map<string, string[]>();
  for (const ur of (userRoles as Row[]) ?? []) {
    const adminId = ur.admin_user_id as string;
    const role = roleById.get(ur.role_id as string);
    if (!role) continue;
    const list = rolesByAdmin.get(adminId) ?? [];
    list.push(role.name as string);
    rolesByAdmin.set(adminId, list);
  }
  return (admins as Row[]).map((a) => ({ ...a, roles: rolesByAdmin.get(a.id as string) ?? [] }));
}

export async function listRoles(): Promise<Row[]> {
  const db = adminDb();
  if (!db) return [];
  const { data, error } = await db.from("roles").select("*").order("name");
  if (error || !data) return [];
  return data as Row[];
}

export async function listPromotions(): Promise<Row[]> {
  const db = adminDb();
  if (!db) return [];
  const { data, error } = await db.from("promotions").select("*").order("created_at", { ascending: false });
  if (error || !data) return [];
  return data as Row[];
}

export async function getActivePricingVersion(): Promise<{ id: string; label: string } | null> {
  const db = adminDb();
  if (!db) return null;
  const { data } = await db.from("pricing_versions").select("id, label").eq("status", "ACTIVE").maybeSingle();
  return (data as { id: string; label: string }) ?? null;
}

export async function listSystemSettings(): Promise<Row[]> {
  const db = adminDb();
  if (!db) return [];
  const { data, error } = await db.from("system_settings").select("*").order("key");
  if (error || !data) return [];
  return data as Row[];
}

export interface DashboardStats {
  totalOrders: number;
  revenuePaid: number;
  totalCustomers: number;
  whatsappOrders: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const db = adminDb();
  if (!db) return { totalOrders: 0, revenuePaid: 0, totalCustomers: 0, whatsappOrders: 0 };

  const [{ count: totalOrders }, { data: paidOrders }, { count: totalCustomers }, { count: whatsappOrders }] =
    await Promise.all([
      db.from("orders").select("id", { count: "exact", head: true }),
      db.from("orders").select("total").eq("payment_status", "PAID"),
      db.from("customers").select("id", { count: "exact", head: true }),
      db.from("whatsapp_orders").select("id", { count: "exact", head: true }),
    ]);

  const revenuePaid = ((paidOrders as Row[]) ?? []).reduce((sum, o) => sum + Number(o.total ?? 0), 0);

  return {
    totalOrders: totalOrders ?? 0,
    revenuePaid,
    totalCustomers: totalCustomers ?? 0,
    whatsappOrders: whatsappOrders ?? 0,
  };
}

const ANALYTICS_FUNNEL_STAGES = [
  { key: "add_to_cart", label: "Tambah Keranjang" },
  { key: "checkout_started", label: "Mulai Checkout" },
  { key: "whatsapp_clicked", label: "Klik WhatsApp" },
  { key: "order_created", label: "Order Dibuat" },
  { key: "payment_started", label: "Bayar Dimulai" },
  { key: "payment_success", label: "Bayar Sukses" },
  { key: "payment_failed", label: "Bayar Gagal" },
] as const;

export async function getAnalyticsFunnel(): Promise<{ stage: string; value: number }[]> {
  const db = adminDb();
  if (!db) return ANALYTICS_FUNNEL_STAGES.map((s) => ({ stage: s.label, value: 0 }));

  const { data } = await db.from("analytics_events").select("event_type");
  const counts = new Map<string, number>();
  for (const row of (data as Row[]) ?? []) {
    const type = row.event_type as string;
    counts.set(type, (counts.get(type) ?? 0) + 1);
  }
  return ANALYTICS_FUNNEL_STAGES.map((s) => ({ stage: s.label, value: counts.get(s.key) ?? 0 }));
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