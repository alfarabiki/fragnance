import { NextResponse } from "next/server";
import { createClient as createSupabase } from "@supabase/supabase-js";
import { calculate, PricingError } from "@atlase/pricing";
import {
  getFragranceById,
  getBottleById,
  getPackagingById,
  alcoholSellPerMl,
} from "@atlase/config";
import { generateOrderNumber } from "@/lib/order";

interface OrderInput {
  channel?: "WHATSAPP" | "DIRECT_PAYMENT";
  customer: { name: string; phone: string; email?: string };
  address: {
    recipientName: string;
    phone: string;
    provinsi: string;
    kota: string;
    kecamatan: string;
    postalCode: string;
    fullAddress: string;
    note?: string;
  };
  items: Array<{
    fragranceId: string;
    volumeMl: number;
    fragranceMl: number;
    bottleId: string;
    packagingId: string;
    quantity: number;
  }>;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as OrderInput;

    if (!body?.items?.length) {
      return NextResponse.json({ error: { message: "Tidak ada item pesanan." } }, { status: 400 });
    }
    if (!body.customer?.phone || !body.address) {
      return NextResponse.json({ error: { message: "Lengkapi nama, nomor, dan alamat." } }, { status: 400 });
    }

    // ----- Server-side authoritative pricing (§16/§49) — never trust client price -----
    let subtotal = 0;
    const pricedItems: Array<{ unitPrice: number; input: OrderInput["items"][number] }> = [];
    for (const item of body.items) {
      const fragrance = getFragranceById(item.fragranceId);
      const bottle = getBottleById(item.bottleId);
      const pack = getPackagingById(item.packagingId);
      if (!fragrance || !bottle || !pack) {
        return NextResponse.json({ error: { message: "Produk pilihan tidak tersedia." } }, { status: 400 });
      }
      try {
        const quote = calculate({
          fragrance: { id: fragrance.id, name: fragrance.name, pricePerMl: fragrance.pricePerMl, minMl: fragrance.minMl, maxMl: fragrance.maxMl },
          bottle: { id: bottle.id, name: bottle.name, volumeMl: bottle.volumeMl, price: bottle.sellPrice, active: bottle.isActive },
          packaging: { id: pack.id, name: pack.name, price: pack.sellPrice, mandatory: pack.isMandatory, active: pack.isActive },
          alcohol: { pricePerMl: alcoholSellPerMl },
          volumeMl: item.volumeMl,
          fragranceMl: item.fragranceMl,
        });
        subtotal += quote.total * item.quantity;
        pricedItems.push({ unitPrice: quote.total, input: item });
      } catch (e) {
        if (e instanceof PricingError) {
          return NextResponse.json({ error: { message: "Konfigurasi tidak valid." } }, { status: 400 });
        }
        throw e;
      }
    }

    const shipping = 0;
    const discount = 0;
    const total = subtotal + shipping - discount;
    const orderNumber = generateOrderNumber();

    // ----- Persist via servia-role client when env configured (DB = system of record) -----
    let persisted = false;
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (url && key) {
      const db = createSupabase(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

      const { data: customer, error: customerErr } = await db
        .from("customers")
        .upsert(
          { phone: body.customer.phone, name: body.customer.name, email: body.customer.email ?? null },
          { onConflict: "phone" },
        )
        .select("id")
        .single();
      if (customerErr) throw customerErr;

      const { data: order, error: orderErr } = await db
        .from("orders")
        .insert({
          order_number: orderNumber,
          idempotency_key: orderNumber,
          customer_id: customer?.id ?? null,
          channel: body.channel ?? "WHATSAPP",
          status: "DRAFT",
          subtotal,
          discount,
          shipping,
          total,
          pricing_version_label: "v1.0",
        })
        .select("id")
        .single();
      if (orderErr) throw orderErr;

      for (const pi of pricedItems) {
        const { error: itemErr } = await db.from("order_items").insert({
          order_id: order?.id,
          fragrance_id: pi.input.fragranceId,
          unit_price_snapshot: pi.unitPrice,
          quantity: pi.input.quantity,
          line_total: pi.unitPrice * pi.input.quantity,
          name_snapshot: pi.input.fragranceId,
        });
        if (itemErr) throw itemErr;

        const { error: custErr } = await db.from("order_customizations").insert({
          order_id: order?.id,
          fragrance_id: pi.input.fragranceId,
          bottle_id: pi.input.bottleId,
          packaging_id: pi.input.packagingId,
          volume_ml: pi.input.volumeMl,
          fragrance_ml: pi.input.fragranceMl,
          alcohol_ml: pi.input.volumeMl - pi.input.fragranceMl,
          snapshot: { unitPrice: pi.unitPrice },
        });
        if (custErr) throw custErr;
      }

      const { error: addrErr } = await db.from("order_addresses").insert({
        order_id: order?.id,
        recipient_name: body.address.recipientName,
        phone: body.address.phone,
        province: body.address.provinsi,
        city: body.address.kota,
        district: body.address.kecamatan,
        postal_code: body.address.postalCode,
        full_address: body.address.fullAddress,
        note: body.address.note ?? null,
      });
      if (addrErr) throw addrErr;

      await db.from("order_events").insert({
        order_id: order?.id,
        event_type: "order_created",
        to_status: "DRAFT",
        note: "Order dibuat dari storefront",
      });

      const { error: payErr } = await db.from("payments").insert({
        order_id: order?.id,
        method: "QRIS",
        provider: "MIDTRANS",
        amount_requested: total,
        status: "PENDING",
      });
      if (payErr) throw payErr;

      persisted = true;
    }

    const payload = {
      orderNumber,
      channel: body.channel ?? "WHATSAPP",
      total,
      subtotal,
      shipping,
      discount,
      persisted,
      address: body.address,
      items: pricedItems.map((pi) => ({
        fragranceId: pi.input.fragranceId,
        volumeMl: pi.input.volumeMl,
        fragranceMl: pi.input.fragranceMl,
        bottleId: pi.input.bottleId,
        packagingId: pi.input.packagingId,
        quantity: pi.input.quantity,
        unitPrice: pi.unitPrice,
      })),
    };

    return NextResponse.json({ ok: true, order: payload }, { status: 201 });
  } catch (err) {
    console.error("[api/orders] error", err);
    return NextResponse.json({ error: { message: "Pesanan belum bisa dibuat. Silakan coba lagi." } }, { status: 500 });
  }
}