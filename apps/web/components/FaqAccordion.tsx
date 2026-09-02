"use client";

import { useState } from "react";
import { cn } from "@atlase/ui";

const FAQ_ITEMS = [
  { q: "Berapa harga parfumnya?", a: "Mulai dari Rp29.000. Harga naik sesuai ukuran dan kekuatan aroma yang kamu pilih." },
  { q: "Bisa pilih ukuran?", a: "Tentu. Kamu bisa pilih 30, 50, 70, atau 100 ml." },
  { q: "Bisa menentukan kekuatan aroma?", a: "Bisa. Atur lewat 'Atur Kekuatan Aroma' — dari Lembut hingga Kuat." },
  { q: "Bisa pesan lewat WhatsApp?", a: "Bisa. Itu cara paling mudah. Kamu tinggal lanjut ke WhatsApp setelah pilih parfum." },
  { q: "Bisa bayar dengan QRIS?", a: "Bisa. Bayar via QRIS langsung dari halaman pembayaran." },
  { q: "Berapa lama proses pembuatannya?", a: "Setelah konfirmasi pesanan, biasanya 1-2 hari kerja." },
  { q: "Bisa request botol?", a: "Bisa, tergantung ketersediaan. Hubungi kami via WhatsApp." },
  { q: "Bisa pesan untuk hadiah?", a: "Bisa. Tambahkan packaging Premium atau Gift saat checkout." },
];

export function FaqAccordion() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <div className="flex flex-col gap-3">
      {FAQ_ITEMS.map((item, idx) => {
        const isOpen = openIdx === idx;
        return (
          <div
            key={item.q}
            className="overflow-hidden rounded-lg border border-black-400 bg-black-600"
          >
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpenIdx(isOpen ? null : idx)}
              className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left"
            >
              <span className="text-heading-2 text-ivory">{item.q}</span>
              <span
                className={cn(
                  "shrink-0 text-emerald transition-transform duration-150",
                  isOpen ? "rotate-45" : "rotate-0",
                )}
                aria-hidden="true"
              >
                +
              </span>
            </button>
            <div
              className={cn(
                "grid transition-all duration-300 ease-out",
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
              )}
            >
              <div className="overflow-hidden">
                <p className="px-4 pb-4 text-body text-muted-gray">{item.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}