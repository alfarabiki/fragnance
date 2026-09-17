"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Stack, PriceDisplay } from "@atlase/ui";
import { calculate, PricingError } from "@atlase/pricing";
import { useCart } from "./CartProvider";
import type { CartItem } from "@/lib/cart";

const STRENGTH_PRESETS = [
  { label: "Lembut", ml: 15 },
  { label: "Sedang", ml: 25 },
  { label: "Kuat", ml: 35 },
] as const;

export function CartDrawer() {
  const { items, subtotal, count, increment, decrement, remove, updateItem, catalog } = useCart();
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
                          <CartItemOptions
                            item={item}
                            catalog={catalog}
                            onChange={(next) => updateItem(item.itemId, next)}
                          />
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

function CartItemOptions({
  item,
  catalog,
  onChange,
}: {
  item: CartItem;
  catalog: ReturnType<typeof useCart>["catalog"];
  onChange: (item: CartItem) => void;
}) {
  const fragrance = catalog.fragrances.find((entry) => entry.id === item.fragranceId);
  const packaging = catalog.packaging.find((entry) => entry.id === item.packagingId);
  if (!fragrance || !packaging) return null;

  const bottlesForVolume = (volumeMl: number) =>
    catalog.bottles.filter((bottle) => bottle.volumeMl === volumeMl);
  const strengthOptions = STRENGTH_PRESETS.filter(
    (preset) =>
      preset.ml >= fragrance.minMl && preset.ml <= fragrance.maxMl && preset.ml <= item.volumeMl,
  );

  const update = (changes: Partial<CartItem>) => {
    const next = { ...item, ...changes };
    const bottle = catalog.bottles.find((entry) => entry.id === next.bottleId);
    if (!bottle || !fragrance.inStock || !bottle.inStock || !packaging.inStock) return;
    try {
      const quote = calculate({
        fragrance: {
          id: fragrance.id,
          name: fragrance.name,
          pricePerMl: fragrance.effectivePricePerMl,
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
          id: packaging.id,
          name: packaging.name,
          price: packaging.sellPrice,
          mandatory: packaging.isMandatory,
          active: packaging.isActive,
        },
        alcohol: { pricePerMl: catalog.alcoholSellPerMl },
        volumeMl: next.volumeMl,
        fragranceMl: next.fragranceMl,
      });
      onChange({ ...next, bottleName: bottle.name, unitPrice: quote.total });
    } catch (error) {
      if (!(error instanceof PricingError)) throw error;
    }
  };

  const selectVolume = (volumeMl: number) => {
    const available = bottlesForVolume(volumeMl);
    const bottle =
      available.find((entry) => entry.name.toLowerCase().includes("standard")) ?? available[0];
    if (!bottle || !bottle.inStock) return;
    const fragranceMl = Math.min(item.fragranceMl, volumeMl, fragrance.maxMl);
    if (fragranceMl < fragrance.minMl) return;
    update({ volumeMl, fragranceMl, bottleId: bottle.id, bottleName: bottle.name });
  };

  return (
    <fieldset className="mt-4 border-t border-ivory-200 pt-3">
      <legend className="text-caption font-semibold uppercase tracking-[0.12em] text-muted-gray">
        Atur parfummu
      </legend>
      <div className="mt-2 space-y-3">
        <OptionGroup label="Ukuran">
          {catalog.volumePresets.map((volumeMl) => {
            const available = bottlesForVolume(volumeMl).some((bottle) => bottle.inStock);
            return (
              <ChoiceButton key={volumeMl} selected={item.volumeMl === volumeMl} disabled={!available} onClick={() => selectVolume(volumeMl)}>
                {volumeMl} ml
              </ChoiceButton>
            );
          })}
        </OptionGroup>
        <OptionGroup label="Kuat aroma">
          {strengthOptions.map((preset) => (
            <ChoiceButton key={preset.label} selected={item.fragranceMl === preset.ml} onClick={() => update({ fragranceMl: preset.ml })}>
              {preset.label}
            </ChoiceButton>
          ))}
        </OptionGroup>
        <OptionGroup label="Botol">
          {bottlesForVolume(item.volumeMl).map((bottle) => (
            <ChoiceButton key={bottle.id} selected={item.bottleId === bottle.id} disabled={!bottle.inStock} onClick={() => update({ bottleId: bottle.id, bottleName: bottle.name })}>
              {bottle.name}
            </ChoiceButton>
          ))}
        </OptionGroup>
      </div>
    </fieldset>
  );
}

function OptionGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-caption text-muted-gray">{label}</p>
      <div className="mt-1.5 flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function ChoiceButton({
  selected,
  disabled = false,
  onClick,
  children,
}: {
  selected: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      disabled={disabled}
      onClick={onClick}
      className={`rounded-full border px-2.5 py-1 text-caption transition ${
        selected ? "border-emerald bg-emerald text-black" : "border-ivory-200 text-black hover:border-emerald"
      } disabled:cursor-not-allowed disabled:opacity-40`}
    >
      {children}
    </button>
  );
}
