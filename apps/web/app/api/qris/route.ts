import { NextResponse } from "next/server";
import { generateDynamic, isConfigured, calculateServiceFee } from "@atlase/pricing";
import { rateLimit, clientIp, isCrossOrigin } from "@/lib/security";

/**
 * POST /api/qris
 * Generate dynamic QRIS string from the configured static payload.
 * No Midtrans needed — pure EMVCo TLV transform.
 *
 * Body: { nominal: number }  (amount in Rupiah)
 * Response: { qris: string, merchantName: string, baseAmount, serviceFee, totalAmount }
 */
export async function POST(req: Request) {
  try {
    if (isCrossOrigin(req)) {
      return NextResponse.json({ error: { message: "Permintaan ditolak." } }, { status: 403 });
    }
    if (!rateLimit(`qris:${clientIp(req)}`, { max: 20, windowMs: 60_000 })) {
      return NextResponse.json({ error: { message: "Terlalu banyak percobaan." } }, { status: 429 });
    }

    const body = (await req.json()) as { nominal?: number };
    const nominal = Number(body?.nominal);

    if (!Number.isFinite(nominal) || nominal <= 0) {
      return NextResponse.json({ error: { message: "Nominal harus angka positif." } }, { status: 400 });
    }

    if (!isConfigured()) {
      return NextResponse.json(
        { error: { message: "QRIS belum dikonfigurasi. Hubungi admin." } },
        { status: 501 },
      );
    }

    // Calculate service fee (MDR) on top of base amount
    const fee = calculateServiceFee(nominal);

    // Generate dynamic QRIS with the total amount (base + fee)
    const result = generateDynamic(fee.totalAmount);

    return NextResponse.json({
      qris: result.qris,
      merchantName: result.merchantName,
      baseAmount: fee.baseAmount,
      serviceFee: fee.serviceFee,
      totalAmount: fee.totalAmount,
      mdrRate: fee.mdrRate,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "QRIS gagal dibuat.";
    console.error("[api/qris] error", err);
    return NextResponse.json({ error: { message } }, { status: 500 });
  }
}
