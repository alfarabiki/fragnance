"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button, Stack, PriceDisplay, Container, Badge } from "@atlase/ui";
import { useCart } from "@/components/cart/CartProvider";
import {
  buildWhatsAppMessage,
  buildWhatsAppLink,
  type OrderAddress,
} from "@/lib/whatsapp";

type Channel = "whatsapp" | "qris";

const defaultAddress: OrderAddress = {
  recipientName: "",
  phone: "",
  fullAddress: "",
  district: "",
  city: "",
  province: "",
  postalCode: "",
  note: "",
};

function PaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const channel = (searchParams.get("channel") as Channel) || "whatsapp";
  const orderNumber =
    searchParams.get("order") || `ATL-${Date.now()}`;

  const { items, subtotal } = useCart();
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    if (channel === "qris") {
      const timer = setTimeout(() => setPaid(true), 8000);
      return () => clearTimeout(timer);
    }
  }, [channel]);

  if (items.length === 0) {
    return (
      <Container className="py-20 text-center">
        <h1 className="text-display-3 font-semibold">Keranjang kosong.</h1>
        <Button
          intent="primary"
          size="lg"
          className="mt-6"
          onClick={() => router.push("/buat-parfum")}
        >
          Cari Aroma
        </Button>
      </Container>
    );
  }

  const phone = "6281234567890";
  const message = buildWhatsAppMessage({
    orderNumber,
    items,
    total: subtotal,
    customer: { name: "Pembeli", phone },
    address: defaultAddress,
  });
  const waLink = buildWhatsAppLink(phone, message);

  return (
    <main className="min-h-screen bg-ivory py-10 text-black">
      <Container className="max-w-[560px]">
        {channel === "whatsapp" ? (
          <Stack className="gap-6">
            <div>
              <Badge variant="success">Pesan via WhatsApp</Badge>
              <h1 className="text-display-3 mt-3 font-semibold">
                Selesaikan via WhatsApp
              </h1>
              <p className="text-body mt-2 text-muted-gray">
                Order #{orderNumber} sudah dibuat. Lanjut ke WhatsApp untuk
                mengirim pesananmu.
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
                    <span className="text-body-sm">
                      {formatRp(item.unitPrice * item.quantity)}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-2 flex justify-between border-t border-ivory-200 pt-2">
                <span className="text-body font-medium">Total</span>
                <PriceDisplay price={subtotal} />
              </div>
            </div>

            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center rounded-lg bg-emerald px-6 py-3 text-button font-semibold text-black transition active:scale-[0.98]"
            >
              Buka WhatsApp
            </a>
            <p className="text-caption text-center text-muted-gray">
              Ini membuka WhatsApp dengan detail pesananmu. Kirim, lalu admin
              Atlase akan konfirmasi.
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
            <PriceDisplay price={subtotal} />
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
              <h1 className="text-display-3 mt-3 font-semibold">
                Menunggu Pembayaran
              </h1>
              <p className="text-body mt-2 text-muted-gray">
                Scan QRIS di bawah untuk menyelesaikan pembayaran order #
                {orderNumber}.
              </p>
            </div>
            <div className="flex h-56 w-56 items-center justify-center rounded-xl border-2 border-dashed border-ivory-200 bg-white">
              <span className="text-caption text-muted-gray">QRIS Placeholder</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-ivory-200 bg-white px-4 py-3">
              <span className="text-body">Total</span>
              <PriceDisplay price={subtotal} />
            </div>
            <p className="text-caption text-muted-gray animate-pulse">
              Menunggu konfirmasi pembayaran...
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

export default function PaymentPage() {
  return (
    <Suspense fallback={<div />}>
      <PaymentContent />
    </Suspense>
  );
}