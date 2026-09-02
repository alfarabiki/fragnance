"use client";

import { useState } from "react";
import { Container, Stack } from "@atlase/ui";
import { CartDrawer } from "@/components/cart/CartDrawer";

const LINKS = [
  { href: "/produk/dior-inspired", label: "Aroma" },
  { href: "/buat-parfum", label: "Buat Parfum" },
  { href: "#faq", label: "FAQ" },
];

export function SiteNav() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-[100] bg-black/85 backdrop-blur">
      <Container className="flex h-16 items-center justify-between">
        <span className="text-display-3 font-semibold">ATLASE</span>

        {/* Desktop links */}
        <Stack direction="row" className="hidden items-center gap-6 sm:flex">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="text-body hover:text-emerald">
              {l.label}
            </a>
          ))}
          <CartDrawer />
        </Stack>

        {/* Mobile: cart always visible + hamburger for the rest */}
        <Stack direction="row" className="items-center gap-2 sm:hidden">
          <CartDrawer />
          <button
            type="button"
            aria-label={open ? "Tutup menu" : "Buka menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-md text-ivory"
          >
            <span className="relative block h-4 w-5">
              <span
                className={`absolute left-0 top-0 block h-0.5 w-5 bg-current transition-transform ${open ? "translate-y-[7px] rotate-45" : ""}`}
              />
              <span
                className={`absolute left-0 top-[7px] block h-0.5 w-5 bg-current transition-opacity ${open ? "opacity-0" : ""}`}
              />
              <span
                className={`absolute left-0 top-[14px] block h-0.5 w-5 bg-current transition-transform ${open ? "-translate-y-[7px] -rotate-45" : ""}`}
              />
            </span>
          </button>
        </Stack>
      </Container>

      {open ? (
        <div className="border-t border-black-400 sm:hidden">
          <Container className="flex flex-col py-2">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="py-3 text-body-lg text-ivory hover:text-emerald"
              >
                {l.label}
              </a>
            ))}
          </Container>
        </div>
      ) : null}
    </nav>
  );
}
