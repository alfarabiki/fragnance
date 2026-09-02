"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button, Stack, PriceDisplay } from "@atlase/ui";
import { useCart } from "./CartProvider";

export function CartDrawer() {
  const { items, subtotal, count, increment, decrement, remove } = useCart();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Buka keranjang"
        className="relative inline-flex items-center justify-center rounded-md px-3 py-2 text-body text-ivory hover:text-emerald"
      >
        Keranjang
        {count > 0 ? (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald px-1 text-caption font-semibold text-black">
            {count}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="fixed inset-0 z-[400]">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <aside
            role="dialog"
            aria-label="Keranjang belanja"
            className="absolute right-0 top-0 flex h-full w-full max-w-sm flex-col bg-ivory text-black shadow-xl"
          >
            <header className="flex items-center justify-between border-b border-ivory-200 px-6 py-4">
              <h2 className="text-heading-1">Keranjangmu</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Tutup"
                className="rounded p-2 text-muted-gray hover:text-black"
              >
                ×
              </button>
            </header>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="mt-16 text-center">
                  <p className="text-body">Belum ada parfum di keranjangmu.</p>
                  <p className="text-caption text-muted-gray mt-1">
                    Yuk cari aroma yang cocok.
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-ivory-200">
                  {items.map((item) => (
                    <li key={item.itemId} className="py-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-body font-medium">{item.fragranceName}</p>
                          <p className="text-caption text-muted-gray">
                            {item.volumeMl} ml · Aroma {item.fragranceMl} ml ·{" "}
                            {item.bottleName} · {item.packagingName}
                          </p>
                          <PriceDisplay price={item.unitPrice} />
                        </div>
                        <button
                          type="button"
                          onClick={() => remove(item.itemId)}
                          aria-label={`Hapus ${item.fragranceName}`}
                          className="text-caption text-error"
                        >
                          Hapus
                        </button>
                      </div>
                      <div className="mt-2 inline-flex items-center gap-3 rounded-full border border-ivory-200 px-3 py-1">
                        <button
                          type="button"
                          onClick={() => decrement(item.itemId)}
                          aria-label="Kurangi jumlah"
                          className="h-7 w-7 rounded-full hover:bg-ivory-200"
                        >
                          −
                        </button>
                        <span className="text-body">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => increment(item.itemId)}
                          aria-label="Tambah jumlah"
                          className="h-7 w-7 rounded-full hover:bg-ivory-200"
                        >
                          +
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {items.length > 0 ? (
              <footer className="border-t border-ivory-200 px-6 py-4">
                <Stack className="gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-body">Subtotal</span>
                    <PriceDisplay price={subtotal} />
                  </div>
                  <Button
                    intent="primary"
                    size="lg"
                    className="w-full"
                    asChild
                  >
                    <Link href="/checkout" onClick={() => setOpen(false)}>
                      Lanjut Pesan
                    </Link>
                  </Button>
                </Stack>
              </footer>
            ) : null}
          </aside>
        </div>
      ) : null}
    </>
  );
}