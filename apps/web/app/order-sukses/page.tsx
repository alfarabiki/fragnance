"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button, Stack, Container, Badge } from "@atlase/ui";
import { useCart } from "@/components/cart/CartProvider";
import { useEffect } from "react";

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const channel = searchParams.get("channel") || "whatsapp";
  const order = searchParams.get("order") || "";
  const { subtotal } = useCart();

  useEffect(() => {
    localStorage.removeItem("atlase.cart.v1");
  }, []);

  return (
    <main className="min-h-screen bg-ivory py-16 text-black">
      <Container className="max-w-[560px] text-center">
        {channel === "whatsapp" ? (
          <Badge variant="info">Selesai</Badge>
        ) : (
          <Badge variant="success">Lunas</Badge>
        )}
        <h1 className="text-display-3 mt-4 font-semibold">
          Terima kasih atas pesananmu!
        </h1>
        <p className="text-body-lg mt-3 text-muted-gray">
          {channel === "whatsapp"
            ? "Kami sudah menerima pesananmu via WhatsApp. Admin akan menghubungi konfirmasi."
            : "Pembayaranmu sudah diterima. Kami akan segera proses pesananmu."}
        </p>

        <div className="mt-6 rounded-lg border border-ivory-200 bg-white p-6">
          <p className="text-caption text-muted-gray">Nomor Order</p>
          <p className="text-heading-1 mt-1">#{order || "Siap diproses"}</p>
        </div>

        <Stack className="mt-8 items-center gap-3">
          {channel === "whatsapp" ? (
            <p className="text-body text-muted-gray">
              Total estimasi: Rp{subtotal.toLocaleString("id-ID")}
            </p>
          ) : null}
          <Button intent="primary" size="lg" className="w-full" asChild>
            <Link href="/buat-parfum">Pesan Lagi</Link>
          </Button>
          <Button intent="ghost" size="lg" className="w-full" asChild>
            <Link href="/">Kembali ke Beranda</Link>
          </Button>
        </Stack>
      </Container>
    </main>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-ivory" />}>
      <OrderSuccessContent />
    </Suspense>
  );
}