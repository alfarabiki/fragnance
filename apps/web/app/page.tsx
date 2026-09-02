import Image from 'next/image';
import { Button, Container, SectionHeading, Stack, Badge } from '@atlase/ui';
import { SiteNav } from '@/components/SiteNav';
import { PriceTicker } from '@/components/PriceTicker';
import { FaqAccordion } from '@/components/FaqAccordion';
import { ScentField } from '@/components/ScentField';
import { AmbientVideo } from '@/components/AmbientVideo';
import { Reveal, StaggerGroup, StaggerItem } from '@/components/motion/Reveal';
import { ProductCard } from '@/components/ProductCard';

const featuredFragrances = [
  {
    slug: 'dior-inspired',
    name: 'Dior-inspired',
    desc: 'Aroma elegan · Cocok untuk malam',
    price: 29000,
    badge: 'BEST SELLER' as const,
  },
  {
    slug: 'woody-fresh',
    name: 'Woody Fresh',
    desc: 'Segar setiap hari',
    price: 29000,
    badge: 'POPULAR' as const,
  },
  {
    slug: 'sweet-vanilla',
    name: 'Sweet Vanilla',
    desc: 'Manis dan hangat',
    price: 39000,
    badge: 'NEW' as const,
  },
];

export default function HomePage() {
  return (
    <>
      {/* 1. Navbar */}
      <SiteNav />

      {/* 2. Hero */}
      <section className="relative overflow-hidden bg-black py-32 text-ivory">
        <ScentField />
        <Container className="relative">
          <StaggerGroup mode="mount" className="flex flex-col items-start gap-8" stagger={0.12}>
            <StaggerItem>
              <Badge variant="info">Premium · Made Personal</Badge>
            </StaggerItem>
            <StaggerItem>
              <h1 className="text-display-1 font-semibold">
                PREMIUM FRAGRANCE.
                <br />
                MADE PERSONAL.
              </h1>
            </StaggerItem>
            <StaggerItem>
              <PriceTicker target={29000} />
            </StaggerItem>
            <StaggerItem>
              <p className="text-body-lg max-w-md text-muted-gray">
                Parfum premium yang bisa kamu sesuaikan dengan aroma dan budget kamu.
              </p>
            </StaggerItem>
            <StaggerItem className="flex items-center gap-4">
              <Button intent="primary" size="lg" asChild>
                <a href="/buat-parfum">Pilih Aroma</a>
              </Button>
              <Button intent="outline" size="lg" asChild>
                <a href="/buat-parfum">Buat Parfum</a>
              </Button>
            </StaggerItem>
          </StaggerGroup>
        </Container>
      </section>

      {/* 3. Starting Price */}
      <section className="border-b border-black-400">
        <Container className="py-8">
          <Stack direction="row" className="items-center justify-between gap-4">
            <span className="text-body">Mulai dari</span>
            <strong className="text-display-2 text-emerald">Rp29.000</strong>
          </Stack>
        </Container>
      </section>

      {/* 4. Featured Fragrances */}
      <section id="aroma" className="py-24">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="Koleksi"
              title="Pilih aroma favoritmu"
              description="Setiap aroma bisa kamu sesuaikan kekuatannya."
            />
          </Reveal>
          <StaggerGroup className="mt-12 grid gap-6 md:grid-cols-3" stagger={0.1}>
            {featuredFragrances.map((f, i) => (
              <StaggerItem key={f.slug}>
                <ProductCard fragrance={f} priority={i === 0} />
              </StaggerItem>
            ))}
          </StaggerGroup>
        </Container>
      </section>

      {/* 5. How It Works */}
      <section className="bg-black-600 py-24">
        <Container>
          <Reveal>
            <SectionHeading eyebrow="Cara Kerja" title="Gampang, 4 langkah" />
          </Reveal>
          <StaggerGroup className="mt-12 grid gap-6 md:grid-cols-4" stagger={0.08}>
            {[
              ['Pilih Aroma', 'Tentukan wangi favoritmu'],
              ['Atur Ukuran', '30, 50, 70, atau 100 ml'],
              ['Sesuaikan', 'Kekuatan aroma & botol'],
              ['Pesan', 'Langsung via WhatsApp atau QRIS'],
            ].map(([t, d], i) => (
              <StaggerItem key={t}>
                <Stack className="gap-2">
                  <span className="text-display-3 text-emerald">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 className="text-heading-2">{t}</h3>
                  <p className="text-body text-muted-gray">{d}</p>
                </Stack>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </Container>
      </section>

      {/* 6. Build Your Perfume */}
      <section id="buat" className="py-24">
        <Container>
          <div className="grid gap-10 md:grid-cols-2 md:items-center">
            <Reveal className="mx-auto w-full max-w-sm overflow-hidden rounded-lg border border-black-400">
              <AmbientVideo
                mp4="/video/build-panel.mp4"
                webm="/video/build-panel.webm"
                poster="/video/build-panel-poster.jpg"
                className="aspect-[9/16] w-full object-cover"
              />
            </Reveal>
            <Reveal delay={0.1}>
              <SectionHeading
                eyebrow="Buat Sendiri"
                title="Buat Parfum Kamu"
                description="Sesuaikan dengan budget kamu. Info langsung berubah."
              />
              <Button intent="primary" size="lg" className="mt-8" asChild>
                <a href="/buat-parfum">Mulai Buat Parfum</a>
              </Button>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* 7. Price/Value Band */}
      <section className="bg-deep-green py-16">
        <Container className="text-center">
          <Reveal>
            <p className="text-display-3 font-semibold text-ivory">
              Wangi mewah. Harga bersahabat.
            </p>
            <p className="text-body-lg mt-4 text-ivory/80">
              Pilih aroma, atur sendiri, dan simpan uangmu.
            </p>
          </Reveal>
        </Container>
      </section>

      {/* 8. Premium Showcase */}
      <section className="py-24">
        <Container>
          <Reveal>
            <SectionHeading eyebrow="Showcase" title="Ragam Wangi Mewah" />
          </Reveal>
          <StaggerGroup className="mt-12 grid gap-6 md:grid-cols-2" stagger={0.12}>
            <StaggerItem className="group relative aspect-[4/5] overflow-hidden rounded-lg">
              <Image
                src="/images/showcase-fresh.jpg"
                alt="Aroma segar dengan bunga dan madu"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-8">
                <Badge variant="info">Top Note</Badge>
                <h3 className="text-heading-1 mt-3">Aroma Segar</h3>
                <p className="text-body mt-2 text-muted-gray">Untuk siang yang aktif.</p>
              </div>
            </StaggerItem>
            <StaggerItem className="group relative aspect-[4/5] overflow-hidden rounded-lg">
              <Image
                src="/images/showcase-warm.jpg"
                alt="Aroma hangat dengan botol emas"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-8">
                <Badge variant="success">Base Note</Badge>
                <h3 className="text-heading-1 mt-3">Aroma Hangat</h3>
                <p className="text-body mt-2 text-muted-gray">Untuk malam yang elegan.</p>
              </div>
            </StaggerItem>
          </StaggerGroup>
        </Container>
      </section>

      {/* 9. Testimonials */}
      <section className="bg-black-600 py-24">
        <Container>
          <Reveal>
            <SectionHeading eyebrow="Testimoni" title="Kata Mereka" />
          </Reveal>
          <StaggerGroup className="mt-12 grid gap-6 md:grid-cols-3" stagger={0.1}>
            {[
              ['Siti', 'Wanginya tahan lama, harganya cocok!'],
              ['Andi', 'Gampang banget atur kekuatannya.'],
              ['Rina', 'Pesan via WhatsApp, langsung diantar.'],
            ].map(([n, q]) => (
              <StaggerItem key={n} className="rounded-lg border border-black-400 p-6">
                <figure>
                  <blockquote className="text-body">"{q}"</blockquote>
                  <figcaption className="text-caption mt-3 text-muted-gray">— {n}</figcaption>
                </figure>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </Container>
      </section>

      {/* 10. FAQ */}
      <section id="faq" className="py-24">
        <Container className="max-w-3xl">
          <Reveal>
            <SectionHeading eyebrow="FAQ" title="Pertanyaan Umum" />
          </Reveal>
          <Reveal delay={0.1} className="mt-12">
            <FaqAccordion />
          </Reveal>
        </Container>
      </section>

      {/* 11. WhatsApp CTA */}
      <section className="py-24 text-center">
        <Container>
          <Reveal>
            <Stack className="items-center gap-6">
              <h2 className="text-display-3 font-semibold">Tinggal WhatsApp.</h2>
              <p className="text-body-lg max-w-md text-muted-gray">
                Pesan mudah, harga transparan, dan bisa bayar QRIS.
              </p>
              <Button intent="primary" size="xl" asChild>
                <a href="https://wa.me/6281234567890" target="_blank" rel="noopener noreferrer">
                  Pesan via WhatsApp
                </a>
              </Button>
            </Stack>
          </Reveal>
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
