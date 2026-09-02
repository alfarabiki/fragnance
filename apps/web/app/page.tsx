import {
  Button,
  Container,
  SectionHeading,
  Stack,
  Badge,
  Pill,
  PriceDisplay,
  Skeleton,
} from "@atlase/ui";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { PriceTicker } from "@/components/PriceTicker";
import { FaqAccordion } from "@/components/FaqAccordion";
import { ProductImage } from "@/components/ProductImage";

const featuredFragrances = [
  {
    slug: "dior-inspired",
    name: "Dior-inspired",
    desc: "Aroma elegan · Cocok untuk malam",
    price: 29000,
    badge: "BEST SELLER" as const,
  },
  {
    slug: "woody-fresh",
    name: "Woody Fresh",
    desc: "Segar setiap hari",
    price: 29000,
    badge: "POPULAR" as const,
  },
  {
    slug: "sweet-vanilla",
    name: "Sweet Vanilla",
    desc: "Manis dan hangat",
    price: 39000,
    badge: "NEW" as const,
  },
];

export default function HomePage() {
  return (
    <>
      {/* 1. Navbar */}
      <nav className="sticky top-0 z-[100] bg-black/85 backdrop-blur">
        <Container className="flex h-16 items-center justify-between">
          <span className="text-display-3 font-semibold">ATLASE</span>
<Stack direction="row" className="items-center gap-6">
            <a href="/produk/dior-inspired" className="text-body hover:text-emerald">
              Aroma
            </a>
            <a href="/buat-parfum" className="text-body hover:text-emerald">
              Buat Parfum
            </a>
            <a href="#faq" className="text-body hover:text-emerald">
              FAQ
            </a>
            <CartDrawer />
          </Stack>
        </Container>
      </nav>

      {/* 2. Hero */}
      <section className="relative bg-black py-32 text-ivory">
        <Container>
          <Stack className="gap-8 items-start">
            <Badge variant="info">Premium · Made Personal</Badge>
            <h1 className="text-display-1 font-semibold">
              PREMIUM FRAGRANCE.
              <br />
              MADE PERSONAL.
            </h1>
            <PriceTicker target={29000} />
            <p className="text-body-lg max-w-md text-muted-gray">
              Parfum premium yang bisa kamu sesuaikan dengan aroma dan budget
              kamu.
            </p>
<div className="flex gap-4 item-center">
              <Button intent="primary" size="lg" asChild>
                <a href="/buat-parfum">Pilih Aroma</a>
              </Button>
              <Button intent="outline" size="lg" asChild>
                <a href="/buat-parfum">Buat Parfum</a>
              </Button>
            </div>
          </Stack>
        </Container>
      </section>

      {/* 3. Starting Price */}
      <section className="border-b border-black-400">
        <Container className="py-8">
          <Stack direction="row" className="items-center justify-between gap-4">
            <span className="text-body">Mulai dari</span>
            <strong className="text-display-2 text-emerald">
              Rp29.000
            </strong>
          </Stack>
        </Container>
      </section>

      {/* 4. Featured Fragrances */}
      <section id="aroma" className="py-24">
        <Container>
          <SectionHeading
            eyebrow="Koleksi"
            title="Pilih aroma favoritmu"
            description="Setiap aroma bisa kamu sesuaikan kekuatannya."
          />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
{featuredFragrances.map((f, i) => (
              <article
                key={f.slug}
                className="rounded-lg border border-black-400 bg-black-600 p-6 transition hover:-translate-y-1"
              >
                <Stack className="gap-3">
                  <ProductImage alt={f.name} priority={i === 0} />
                  <Pill>{f.badge}</Pill>
                  <h3 className="text-heading-1">{f.name}</h3>
                  <p className="text-body-sm text-muted-gray">{f.desc}</p>
                  <PriceDisplay price={f.price} prefix />
                  <Button intent="primary" size="md" asChild>
                    <a href={`/produk/${f.slug}`}>Pilih Aroma</a>
                  </Button>
                </Stack>
              </article>
            ))}
          </div>
        </Container>
      </section>

      {/* 5. How It Works */}
      <section className="bg-black-600 py-24">
        <Container>
          <SectionHeading
            eyebrow="Cara Kerja"
            title="Gampang, 4 langkah"
          />
          <div className="mt-12 grid gap-6 md:grid-cols-4">
            {[
              ["Pilih Aroma", "Tentukan wangi favoritmu"],
              ["Atur Ukuran", "30, 50, 70, atau 100 ml"],
              ["Sesuaikan", "Kekuatan aroma & botol"],
              ["Pesan", "Langsung via WhatsApp atau QRIS"],
            ].map(([t, d], i) => (
              <Stack key={t} className="gap-2">
                <span className="text-display-3 text-emerald">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="text-heading-2">{t}</h3>
                <p className="text-body text-muted-gray">{d}</p>
              </Stack>
            ))}
          </div>
        </Container>
      </section>

      {/* 6. Build Your Perfume */}
      <section id="buat" className="py-24">
        <Container>
          <SectionHeading
            eyebrow="Buat Sendiri"
            title="Buat Parfum Kamu"
            description="Sesuaikan dengan budget kamu. Info langsung berubah."
          />
          {/* Placeholder builder — wired in Phase 3 (Customization Engine) */}
          <div className="mt-12 rounded-lg border border-black-400 p-8">
            <Skeleton variant="rect" className="aspect-[16/6] w-full" />
          </div>
        </Container>
      </section>

      {/* 7. Price/Value Band */}
      <section className="bg-deep-green py-16">
        <Container className="text-center">
          <p className="text-display-3 font-semibold text-ivory">
            Wangi mewah. Harga bersahabat.
          </p>
          <p className="text-body-lg mt-4 text-ivory/80">
            Pilih aroma, atur sendiri, dan simpan uangmu.
          </p>
        </Container>
      </section>

      {/* 8. Premium Showcase */}
      <section className="py-24">
        <Container>
          <SectionHeading
            eyebrow="Showcase"
            title="Gram Wangi Mewah"
          />
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <div className="rounded-lg bg-black-600 p-8">
              <Badge variant="info">Top Note</Badge>
              <h3 className="text-heading-1 mt-3">Aroma Segar</h3>
              <p className="text-body mt-2 text-muted-gray">
                Untuk siang yang aktif.
              </p>
            </div>
            <div className="rounded-lg bg-black-600 p-8">
              <Badge variant="success">Base Note</Badge>
              <h3 className="text-heading-1 mt-3">Aroma Hangat</h3>
              <p className="text-body mt-2 text-muted-gray">
                Untuk malam yang elegan.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* 9. Testimonials */}
      <section className="bg-black-600 py-24">
        <Container>
          <SectionHeading eyebrow="Testimoni" title="Kata Mereka" />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              ["Siti", "Wanginya tahan lama, harganya cocok!"],
              ["Andi", "Gampang banget atur kekuatannya."],
              ["Rina", "Pesan via WhatsApp, langsung diantar."],
            ].map(([n, q]) => (
              <figure key={n} className="rounded-lg border border-black-400 p-6">
                <blockquote className="text-body">"{q}"</blockquote>
                <figcaption className="text-caption mt-3 text-muted-gray">
                  — {n}
                </figcaption>
              </figure>
            ))}
          </div>
        </Container>
      </section>

{/* 10. FAQ */}
      <section id="faq" className="py-24">
        <Container className="max-w-3xl">
          <SectionHeading eyebrow="FAQ" title="Pertanyaan Umum" />
          <div className="mt-12">
            <FaqAccordion />
          </div>
        </Container>
      </section>

      {/* 11. WhatsApp CTA */}
      <section className="py-24 text-center">
        <Container>
          <Stack className="items-center gap-6">
            <h2 className="text-display-3 font-semibold">
              Tinggal WhatsApp.
            </h2>
            <p className="text-body-lg max-w-md text-muted-gray">
              Pesan mudah, harga transparan, dan bisa bayar QRIS.
            </p>
            <Button intent="primary" size="xl" asChild>
              <a href="https://wa.me/6281234567890" target="_blank" rel="noopener noreferrer">
                Pesan via WhatsApp
              </a>
            </Button>
          </Stack>
        </Container>
      </section>

      {/* 12. Footer */}
      <footer className="border-t border-black-400 py-12">
        <Container>
          <Stack className="gap-4">
            <span className="text-display-3">ATLASE</span>
            <p className="text-caption text-muted-gray">
              Parfum Premium, Sesuai Kamu. © {new Date().getFullYear()} ATLASE.
            </p>
          </Stack>
        </Container>
      </footer>
    </>
  );
}

