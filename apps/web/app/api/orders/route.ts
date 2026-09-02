import { NextResponse } from 'next/server';
import { createClient as createSupabase } from '@supabase/supabase-js';
import { calculate, PricingError } from '@atlase/pricing';
import {
  getFragranceById,
  getBottleById,
  getPackagingById,
  alcoholSellPerMl,
} from '@atlase/config';
import { generateOrderNumber } from '@/lib/order';
import { rateLimit, clientIp, isCrossOrigin } from '@/lib/security';
import { reservationLines, reserveStock } from '@/lib/inventory';
import { trackServer } from '@/lib/analytics-server';

interface OrderInput {
  idempotencyKey?: string;
  channel?: 'WHATSAPP' | 'DIRECT_PAYMENT';
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
    if (isCrossOrigin(req)) {
      return NextResponse.json({ error: { message: 'Permintaan ditolak.' } }, { status: 403 });
    }
    if (!rateLimit(`orders:${clientIp(req)}`, { max: 10, windowMs: 60_000 })) {
      return NextResponse.json(
        { error: { message: 'Terlalu banyak percobaan. Coba lagi sebentar.' } },
        { status: 429 },
      );
    }

    const body = (await req.json()) as OrderInput;

    if (!body?.items?.length) {
      return NextResponse.json({ error: { message: 'Tidak ada item pesanan.' } }, { status: 400 });
    }
    if (!body.customer?.phone || !body.address) {
      return NextResponse.json(
        { error: { message: 'Lengkapi nama, nomor, dan alamat.' } },
        { status: 400 },
      );
    }

    // ----- Server-side authoritative pricing (§16/§49) — never trust client price -----
    let subtotal = 0;
    const pricedItems: Array<{
      unitPrice: number;
      input: OrderInput['items'][number];
      fragranceName: string;
      fragranceSlug: string;
      bottleSlug: string;
      packagingSlug: string;
    }> = [];
    for (const item of body.items) {
      const fragrance = getFragranceById(item.fragranceId);
      const bottle = getBottleById(item.bottleId);
      const pack = getPackagingById(item.packagingId);
      if (!fragrance || !bottle || !pack) {
        return NextResponse.json(
          { error: { message: 'Produk pilihan tidak tersedia.' } },
          { status: 400 },
        );
      }
      try {
        const quote = calculate({
          fragrance: {
            id: fragrance.id,
            name: fragrance.name,
            pricePerMl: fragrance.pricePerMl,
            minMl: fragrance.minMl,
            maxMl: fragrance.maxMl,
          },
          bottle: {
            id: bottle.id,
            name: bottle.name,
            volumeMl: bottle.volumeMl,
            price: bottle.sellPrice,
            active: bottle.isActive,
          },
          packaging: {
            id: pack.id,
            name: pack.name,
            price: pack.sellPrice,
            mandatory: pack.isMandatory,
            active: pack.isActive,
          },
          alcohol: { pricePerMl: alcoholSellPerMl },
          volumeMl: item.volumeMl,
          fragranceMl: item.fragranceMl,
        });
        subtotal += quote.total * item.quantity;
        pricedItems.push({
          unitPrice: quote.total,
          input: item,
          fragranceName: fragrance.name,
          fragranceSlug: fragrance.slug,
          bottleSlug: bottle.slug,
          packagingSlug: pack.slug,
        });
      } catch (e) {
        if (e instanceof PricingError) {
          return NextResponse.json(
            { error: { message: 'Konfigurasi tidak valid.' } },
            { status: 400 },
          );
        }
        throw e;
      }
    }

    const shipping = 0;
    const discount = 0;
    const total = subtotal + shipping - discount;
    const generatedOrderNumber = generateOrderNumber();
    // ponytail: idempotency window is "this checkout page instance" — the
    // client mints one key per mount and resends it on retry/double-click.
    // A refresh mints a new key (new order). Good enough for MVP; a longer
    // guarantee would need the client to persist the key itself.
    const idemKey = body.idempotencyKey?.trim() || generatedOrderNumber;

    let orderId: string | null = null;
    let orderNumber = generatedOrderNumber;

    // ----- Persist via service-role client when env configured (DB = system of record) -----
    let persisted = false;
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (url && key) {
      const db = createSupabase(url, key, {
        auth: { autoRefreshToken: false, persistSession: false },
      });

      const { data: existingOrder, error: existingErr } = await db
        .from('orders')
        .select('id, order_number')
        .eq('idempotency_key', idemKey)
        .maybeSingle();
      if (existingErr) throw existingErr;

      if (existingOrder) {
        // Replay of a request we already persisted — return the same order,
        // don't insert items/address/payment again.
        orderId = existingOrder.id;
        orderNumber = existingOrder.order_number;
        persisted = true;
      } else {
        const { data: customer, error: customerErr } = await db
          .from('customers')
          .upsert(
            {
              phone: body.customer.phone,
              name: body.customer.name,
              email: body.customer.email ?? null,
            },
            { onConflict: 'phone' },
          )
          .select('id')
          .single();
        if (customerErr) throw customerErr;

        // Consent (§9/§57): record only what the order itself requires —
        // processing the data to fulfill it, and WhatsApp contact when that's
        // the chosen channel. Never auto-grant MARKETING here; that needs its
        // own explicit opt-in, which the checkout form doesn't collect yet.
        if (customer?.id) {
          const now = new Date().toISOString();
          const consents = [
            {
              customer_id: customer.id,
              type: 'DATA_PROCESSING',
              granted: true,
              granted_at: now,
              source: 'checkout',
            },
            ...((body.channel ?? 'WHATSAPP') === 'WHATSAPP'
              ? [
                  {
                    customer_id: customer.id,
                    type: 'WHATSAPP',
                    granted: true,
                    granted_at: now,
                    source: 'checkout',
                  },
                ]
              : []),
          ];
          await db.from('customer_consents').upsert(consents, { onConflict: 'customer_id,type' });
        }

        const { data: order, error: orderErr } = await db
          .from('orders')
          .insert({
            order_number: orderNumber,
            idempotency_key: idemKey,
            customer_id: customer?.id ?? null,
            channel: body.channel ?? 'WHATSAPP',
            status: 'DRAFT',
            subtotal,
            discount,
            shipping,
            total,
            pricing_version_label: 'v1.0',
          })
          .select('id')
          .single();
        if (orderErr) throw orderErr;
        orderId = order?.id ?? null;

        // fragrance_id/bottle_id/packaging_id are real FK uuid columns — the
        // catalog (@atlase/config) uses static string ids, so resolve them
        // to DB row ids by slug (seeded with matching slugs). A slug not
        // found in the DB (unseeded catalog entry) falls back to null —
        // these columns are nullable, so the order still persists.
        const fragranceSlugs = [...new Set(pricedItems.map((pi) => pi.fragranceSlug))];
        const bottleSlugs = [...new Set(pricedItems.map((pi) => pi.bottleSlug))];
        const packagingSlugs = [...new Set(pricedItems.map((pi) => pi.packagingSlug))];
        const [{ data: fragranceRows }, { data: bottleRows }, { data: packagingRows }] =
          await Promise.all([
            db.from('fragrances').select('id, slug').in('slug', fragranceSlugs),
            db.from('bottles').select('id, slug').in('slug', bottleSlugs),
            db.from('packaging').select('id, slug').in('slug', packagingSlugs),
          ]);
        const fragranceIdBySlug = new Map(
          (fragranceRows ?? []).map((r) => [r.slug, r.id as string]),
        );
        const bottleIdBySlug = new Map((bottleRows ?? []).map((r) => [r.slug, r.id as string]));
        const packagingIdBySlug = new Map(
          (packagingRows ?? []).map((r) => [r.slug, r.id as string]),
        );

        const resolvedItems: Array<{
          bottleId: string | null;
          packagingId: string | null;
          quantity: number;
        }> = [];
        for (const pi of pricedItems) {
          const fragranceId = fragranceIdBySlug.get(pi.fragranceSlug) ?? null;
          const bottleId = bottleIdBySlug.get(pi.bottleSlug) ?? null;
          const packagingId = packagingIdBySlug.get(pi.packagingSlug) ?? null;
          resolvedItems.push({ bottleId, packagingId, quantity: pi.input.quantity });

          const { error: itemErr } = await db.from('order_items').insert({
            order_id: order?.id,
            fragrance_id: fragranceId,
            unit_price_snapshot: pi.unitPrice,
            quantity: pi.input.quantity,
            line_total: pi.unitPrice * pi.input.quantity,
            name_snapshot: pi.fragranceName,
          });
          if (itemErr) throw itemErr;

          const { error: custErr } = await db.from('order_customizations').insert({
            order_id: order?.id,
            fragrance_id: fragranceId,
            bottle_id: bottleId,
            packaging_id: packagingId,
            volume_ml: pi.input.volumeMl,
            fragrance_ml: pi.input.fragranceMl,
            alcohol_ml: pi.input.volumeMl - pi.input.fragranceMl,
            snapshot: { unitPrice: pi.unitPrice },
          });
          if (custErr) throw custErr;
        }

        if (orderId) {
          await reserveStock(db, orderId, reservationLines(resolvedItems));
          await trackServer(db, 'order_created', {
            orderId,
            customerId: customer?.id ?? null,
            metadata: { channel: body.channel ?? 'WHATSAPP', total },
          });
        }

        const { error: addrErr } = await db.from('order_addresses').insert({
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

        await db.from('order_events').insert({
          order_id: order?.id,
          event_type: 'order_created',
          to_status: 'DRAFT',
          note: 'Order dibuat dari storefront',
        });

        const { error: payErr } = await db.from('payments').insert({
          order_id: order?.id,
          method: 'QRIS',
          provider: 'MIDTRANS',
          amount_requested: total,
          status: 'PENDING',
        });
        if (payErr) throw payErr;

        persisted = true;
      }
    }

    const payload = {
      orderId,
      orderNumber,
      channel: body.channel ?? 'WHATSAPP',
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
    console.error('[api/orders] error', err);
    return NextResponse.json(
      { error: { message: 'Pesanan belum bisa dibuat. Silakan coba lagi.' } },
      { status: 500 },
    );
  }
}
