"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Stack, PriceDisplay } from "@atlase/ui";
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
        className="relative inline-flex items-center justify-center rounded-md p-2 text-ivory hover:text-emerald"
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M6 8h12l-1 12.5a1.5 1.5 0 0 1-1.5 1.5h-7a1.5 1.5 0 0 1-1.5-1.5L6 8Z" />
          <path d="M9 8V6a3 3 0 0 1 6 0v2" />
        </svg>
        {count > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald px-1 text-caption font-semibold text-black">
            {count}
          </span>
        ) : null}
      </button>

      {open
        ? createPortal(
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
                        <span className="text-body font-medium">Subtotal</span>
                        <PriceDisplay price={subtotal} />
                      </div>
                      <Link
                        href="/checkout"
                        onClick={() => setOpen(false)}
                        className="inline-flex w-full items-center justify-center rounded-md bg-emerald px-5 py-3 text-button font-semibold text-black transition active:scale-[0.98]"
                      >
                        Checkout
                      </Link>
                      <Link
                        href="/checkout?channel=whatsapp"
                        onClick={() => setOpen(false)}
                        className="inline-flex w-full items-center justify-center rounded-md border border-emerald bg-transparent px-5 py-3 text-button font-semibold text-emerald transition hover:bg-emerald-50"
                      >
                        Pesan via WhatsApp
                      </Link>
                    </Stack>
                  </footer>
                ) : null}
              </aside>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}