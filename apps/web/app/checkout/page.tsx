"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button, PriceDisplay, Container } from "@atlase/ui";
import { useCart } from "@/components/cart/CartProvider";
import { generateOrderNumber } from "@/lib/order";
import type { OrderAddress } from "@/lib/whatsapp";

type Step = "pesanan" | "alamat" | "cara";

function CheckoutContent() {
  const { items, subtotal } = useCart();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialChannel = searchParams.get("channel");
  const [step, setStep] = useState<Step>("pesanan");
  const [orderNumber] = useState(() => generateOrderNumber());

  const [form, setForm] = useState<OrderAddress>({
    recipientName: "",
    phone: "",
    fullAddress: "",
    district: "",
    city: "",
    province: "",
    postalCode: "",
    note: "",
  });

  useEffect(() => {
    if (initialChannel === "whatsapp" && step === "alamat") {
      setStep("cara");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addressValid = useMemo(() => {
    return (
      form.recipientName.length >= 2 &&
      form.phone.replace(/\D/g, "").length >= 9 &&
      form.fullAddress.length >= 5 &&
      form.district.length >= 2 &&
      form.city.length >= 2 &&
      form.province.length >= 2 &&
      /^\d{5}$/.test(form.postalCode)
    );
  }, [form]);

  if (items.length === 0) {
    return (
      <Container className="py-20 text-center">
        <h1 className="text-display-3 font-semibold">Belum ada parfum di keranjangmu.</h1>
        <p className="text-body-lg mt-2 text-muted-gray">
          Yuk cari aroma yang cocok.
        </p>
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

  const update = (field: keyof OrderAddress) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  return (
    <main className="min-h-screen bg-ivory py-10 text-black">
      <Container className="max-w-[720px]">
        {/* Stepper */}
        <nav
          aria-label="Proses pemesanan"
          className="mb-8 flex items-center gap-2 text-body-sm"
        >
          {(["pesanan", "alamat", "cara"] as const).map((s, idx) => (
            <span key={s} className="flex items-center gap-2">
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-caption ${
                  step === s ? "bg-emerald text-black" : "bg-ivory-200"
                }`}
              >
                {String(idx + 1).padStart(2, "0")}
              </span>
              <span className={step === s ? "font-medium" : "text-muted-gray"}>
                {s === "pesanan" ? "Pesanan" : s === "alamat" ? "Alamat" : "Cara Pesan"}
              </span>
            </span>
          ))}
        </nav>

        {step === "pesanan" ? (
          <section>
            <h1 className="text-heading-1">Pesananmu</h1>
            <ul className="mt-4 divide-y divide-ivory-200">
              {items.map((item) => (
                <li key={item.itemId} className="flex items-center justify-between py-4">
                  <div>
                    <p className="font-medium">{item.fragranceName}</p>
                    <p className="text-caption text-muted-gray">
                      {item.volumeMl} ml · Aroma {item.fragranceMl} ml · {item.bottleName} ·{" "}
                      {item.packagingName}
                    </p>
                  </div>
                  <div className="text-right">
                    <PriceDisplay price={item.unitPrice * item.quantity} />
                    <p className="text-caption text-muted-gray">× {item.quantity}</p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex items-center justify-between border-t border-ivory-200 pt-4">
              <span className="text-body">Subtotal</span>
              <PriceDisplay price={subtotal} />
            </div>
            <Button intent="primary" size="lg" className="mt-6 w-full" onClick={() => setStep("alamat")}>
              Lanjut Isi Alamat
            </Button>
          </section>
        ) : null}

        {step === "alamat" ? (
          <section>
            <h1 className="text-heading-1">Alamat Pengiriman</h1>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Nama" value={form.recipientName} onChange={update("recipientName")} placeholder="Nama lengkap" />
              <Field label="Nomor WhatsApp" value={form.phone} onChange={update("phone")} placeholder="08xx" prefix="+62" />
              <Field label="Provinsi" value={form.province} onChange={update("province")} placeholder="e.g. DKI Jakarta" />
              <Field label="Kota/Kabupaten" value={form.city} onChange={update("city")} placeholder="e.g. Jakarta Selatan" />
              <Field label="Kecamatan" value={form.district} onChange={update("district")} placeholder="e.g. Kebayoran Baru" />
              <Field label="Kode Pos" value={form.postalCode} onChange={update("postalCode")} placeholder="5 digit" />
            </div>
            <div className="mt-4">
              <label className="block text-label">
                Alamat Lengkap
                <textarea
                  value={form.fullAddress}
                  onChange={update("fullAddress")}
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-ivory-200 bg-white px-3 py-2 text-body focus:ring-2 focus:ring-emerald"
                  placeholder="Nama jalan, no rumah, RT/RW"
                />
              </label>
            </div>
            <div className="mt-2">
              <label className="block text-label">
                Catatan (opsional)
                <textarea
                  value={form.note ?? ""}
                  onChange={update("note")}
                  rows={2}
                  className="mt-1 w-full rounded-lg border border-ivory-200 bg-white px-3 py-2 text-body focus:ring-2 focus:ring-emerald"
                  placeholder="Jam kirim, dsb."
                />
              </label>
            </div>
            <div className="mt-6 flex gap-3">
              <Button intent="ghost" size="lg" onClick={() => setStep("pesanan")}>
                Kembali
              </Button>
              <Button
                intent="primary"
                size="lg"
                className="flex-1"
                disabled={!addressValid}
                onClick={() => setStep("cara")}
              >
                Lanjut Cara Pesan
              </Button>
            </div>
            {!addressValid ? (
              <p className="mt-2 text-caption text-error">
                Lengkapi nama, nomor WA, alamat, dan kode pos 5 digit.
              </p>
            ) : null}
          </section>
        ) : null}

        {step === "cara" ? (
          <section>
            <h1 className="text-heading-1">Cara Pesan</h1>
            <p className="text-body mt-1 text-muted-gray">Pilih cara pesan favoritmu.</p>
            <div className="mt-6 grid gap-4">
              <button
                type="button"
                onClick={() =>
                  router.push(
                    `/payment?channel=whatsapp&order=${encodeURIComponent(orderNumber)}`,
                  )
                }
                className="rounded-lg border border-ivory-200 bg-white p-6 text-left transition hover:border-emerald"
              >
                <span className="block text-heading-2">Pesan via WhatsApp</span>
                <span className="block text-caption text-muted-gray">
                  Cepat dan mudah. Kamu lanjut ke WhatsApp untuk konfirmasi.
                </span>
              </button>
              <button
                type="button"
                onClick={() =>
                  router.push(
                    `/payment?channel=qris&order=${encodeURIComponent(orderNumber)}`,
                  )
                }
                className="rounded-lg border border-ivory-200 bg-white p-6 text-left transition hover:border-emerald"
              >
                <span className="block text-heading-2">Bayar dengan QRIS</span>
                <span className="block text-caption text-muted-gray">
                  Bayar langsung via QRIS dari halaman pembayaran.
                </span>
              </button>
            </div>
            <Button intent="ghost" size="lg" className="mt-6" onClick={() => setStep("alamat")}>
              Kembali
            </Button>
          </section>
        ) : null}
      </Container>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  prefix,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  prefix?: string;
}) {
  return (
    <label className="block text-label">
      {label}
      <div className="mt-1 flex items-center overflow-hidden rounded-lg border border-ivory-200 bg-white focus-within:ring-2 focus-within:ring-emerald">
        {prefix ? (
          <span className="border-r border-ivory-200 px-3 py-2 text-body text-muted-gray">
            {prefix}
          </span>
        ) : null}
        <input
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full bg-transparent px-3 py-2 text-body focus:outline-none"
        />
      </div>
    </label>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div />}>
      <CheckoutContent />
    </Suspense>
  );
}