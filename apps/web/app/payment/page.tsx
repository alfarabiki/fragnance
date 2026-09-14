"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button, Stack, PriceDisplay, Container, Badge } from "@atlase/ui";
import { useCart } from "@/components/cart/CartProvider";
import { loadOrderSession, type OrderSession } from "@/lib/order-session";
import { buildWhatsAppMessage, buildWhatsAppLink } from "@/lib/whatsapp";
import { track } from "@/lib/analytics";
import { sendPaymentAlert } from "@/lib/telegram";

type Channel = "whatsapp" | "qris";

const BUSINESS_WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "6287887753802";

function PaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const channel = (searchParams.get("channel") as Channel) || "whatsapp";
  const orderNumber = searchParams.get("order") || "";

  const { items, subtotal } = useCart();
  const [session] = useState<OrderSession | null>(() => loadOrderSession(orderNumber));
  const [qrisData, setQrisData] = useState<{
    qrisString: string;
    merchantName: string;
    baseAmount: number;
    serviceFee: number;
    totalAmount: number;
  } | null>(null);
  const [paid, setPaid] = useState(false);
  const [qrisError, setQrisError] = useState<string | null>(null);

  // QRIS: generate dynamic QRIS string from our static→dynamic converter
  // (no Midtrans needed — pure EMVCo TLV transform from @atlase/pricing)
  useEffect(() => {
    if (channel !== "qris" || !orderNumber) return;

    const amount = session?.total ?? subtotal;
    if (!amount || amount <= 0) {
      setQrisError("Nominal tidak valid.");
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/qris", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nominal: amount }),
        });
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok || !data?.qris) {
          setQrisError(data?.error?.message || "QRIS gagal dibuat.");
          return;
        }
        setQrisData({
          qrisString: data.qris,
          merchantName: data.merchantName,
          baseAmount: data.baseAmount,
          serviceFee: data.serviceFee,
          totalAmount: data.totalAmount,
        });
      } catch {
        if (!cancelled) setQrisError("Gagal membuat QRIS. Periksa koneksi.");
      }
    })();

    // Simple polling for payment status (when Supabase is configured)
    if (session?.persisted) {
      const pollTimer = setInterval(async () => {
        const statusRes = await fetch(`/api/orders/${encodeURIComponent(orderNumber)}/status`);
        if (!statusRes.ok) return;
        const status = await statusRes.json();
        if (status.paymentStatus === "PAID") {
          setPaid(true);
          clearInterval(pollTimer);
        }
      }, 5000);

      return () => {
        cancelled = true;
        clearInterval(pollTimer);
      };
    }

    return () => { cancelled = true; };
  }, [channel, orderNumber, session, subtotal]);

  if (items.length === 0) {
    return (
      <Container className="py-20 text-center">
        <h1 className="text-display-3 font-semibold">Keranjang kosong.</h1>
        <Button intent="primary" size="lg" className="mt-6" onClick={() => router.push("/buat-parfum")}>
          Cari Aroma
        </Button>
      </Container>
    );
  }

  const total = qrisData?.totalAmount ?? session?.total ?? subtotal;
  const message = buildWhatsAppMessage({
    orderNumber,
    items,
    total,
    customer: session?.customer ?? { name: "Pembeli", phone: "" },
    address: session?.address ?? {
      recipientName: "",
      phone: "",
      fullAddress: "",
      district: "",
      city: "",
      province: "",
      postalCode: "",
    },
  });
  const waLink = buildWhatsAppLink(BUSINESS_WHATSAPP, message);

  return (
    <main className="min-h-screen bg-ivory py-10 text-black">
      <Container className="max-w-[560px]">
        {channel === "whatsapp" ? (
          <Stack className="gap-6">
            <div>
              <Badge variant="success">Pesan via WhatsApp</Badge>
              <h1 className="text-display-3 mt-3 font-semibold">Selesaikan via WhatsApp</h1>
              <p className="text-body mt-2 text-muted-gray">
                Order #{orderNumber} sudah dibuat. Lanjut ke WhatsApp untuk mengirim pesananmu.
              </p>
            </div>

            <div className="rounded-lg border border-ivory-200 bg-white p-4">
              <h2 className="text-heading-2">Ringkasan Pesanan</h2>
              <ul className="mt-3 divide-y divide-ivory-200">
                {items.map((item) => (
                  <li key={item.itemId} className="flex justify-between py-2">
                    <span className="text-body-sm">
                      {item.fragranceName} × {item.quantity}
                    </span>
                    <span className="text-body-sm">{formatRp(item.unitPrice * item.quantity)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-2 flex justify-between border-t border-ivory-200 pt-2">
                <span className="text-body font-medium">Total</span>
                <PriceDisplay price={total} />
              </div>
            </div>

            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track("whatsapp_clicked", { orderNumber })}
              className="inline-flex w-full items-center justify-center rounded-lg bg-emerald px-6 py-3 text-button font-semibold text-black transition active:scale-[0.98]"
            >
              Buka WhatsApp
            </a>
            <p className="text-caption text-center text-muted-gray">
              Ini membuka WhatsApp dengan detail pesananmu. Kirim, lalu admin Miz akan konfirmasi.
            </p>

            <Button
              intent="ghost"
              size="lg"
              className="w-full"
              onClick={() => router.push("/order-sukses?channel=whatsapp&order=" + encodeURIComponent(orderNumber))}
            >
              Saya sudah mengirim pesanan
            </Button>
          </Stack>
        ) : paid ? (
          <Stack className="items-center gap-6 text-center">
            <Badge variant="success">Pembayaran Berhasil</Badge>
            <h1 className="text-display-3 font-semibold">Order Berhasil!</h1>
            <p className="text-body-lg text-muted-gray">
              Pembayaran order #{orderNumber} sudah diterima. Terima kasih!
            </p>
            <PriceDisplay price={total} />
            <Button
              intent="primary"
              size="lg"
              className="w-full"
              onClick={() => router.push("/order-sukses?channel=qris&order=" + encodeURIComponent(orderNumber))}
            >
              Lihat Detail Pesanan
            </Button>
          </Stack>
        ) : (
          <Stack className="items-center gap-6 text-center">
            <div>
              <Badge variant="info">Bayar dengan QRIS</Badge>
              <h1 className="text-display-3 mt-3 font-semibold">Menunggu Pembayaran</h1>
              <p className="text-body mt-2 text-muted-gray">
                Scan QRIS di bawah untuk menyelesaikan pembayaran order #{orderNumber}.
              </p>
            </div>
            {qrisData?.qrisString ? (
              <QRCodeDisplay qrisString={qrisData.qrisString} />
            ) : (
              <div className="flex h-56 w-56 items-center justify-center rounded-xl border-2 border-dashed border-ivory-200 bg-white text-center">
                <span className="px-4 text-caption text-muted-gray">
                  {qrisError ?? "Menyiapkan QRIS..."}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between rounded-lg border border-ivory-200 bg-white px-4 py-3">
              <span className="text-body">Total</span>
              <PriceDisplay price={total} />
            </div>
            {qrisData?.serviceFee ? (
              <p className="text-caption text-muted-gray">
                Termasuk biaya layanan {formatRp(qrisData.serviceFee)} ({Math.round(qrisData.serviceFee / qrisData.baseAmount * 1000) / 10}%)
              </p>
            ) : null}
            
            {/* Manual confirmation since we don't have automatic callback */}
            <div className="w-full rounded-lg border border-ivory-200 bg-white p-4">
              <p className="text-body-sm text-muted-gray mb-3">
                Sudah selesai bayar? Klik tombol di bawah untuk konfirmasi.
              </p>
              <Button
                intent="primary"
                size="lg"
                className="w-full"
                onClick={async () => {
                  // Send Telegram alert to team
                  await sendPaymentAlert({
                    orderNumber,
                    customerName: session?.customer?.name || "Pembeli",
                    customerPhone: session?.customer?.phone || "-",
                    total,
                    items: items.map(i => `${i.fragranceName} x${i.quantity}`).join("\n"),
                    channel: "QRIS",
                  });
                  router.push("/order-sukses?channel=qris&order=" + encodeURIComponent(orderNumber));
                }}
              >
                Saya Sudah Bayar
              </Button>
            </div>
            
            <p className="text-caption text-muted-gray">
              Setelah bayar, admin akan verifikasi pembayaran dalam 5-10 menit.
            </p>
          </Stack>
        )}
      </Container>
    </main>
  );
}

function formatRp(n: number): string {
  return `Rp${n.toLocaleString("id-ID")}`;
}

/**
 * Render QR code image from a QRIS string using a public QR generator API.
 * The QRIS string itself contains the payment info (merchant + amount) —
 * this just turns that string into a scannable QR image.
 */
function QRCodeDisplay({ qrisString }: { qrisString: string }) {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrisString)}`;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={qrUrl}
      alt="Kode QRIS Dinamis"
      className="h-56 w-56 rounded-xl border border-ivory-200 bg-white"
    />
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div />}>
      <PaymentContent />
    </Suspense>
  );
}
