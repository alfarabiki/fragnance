import Image from 'next/image';
import { Button, Container, SectionHeading, Stack, Badge } from '@atlase/ui';
import { SiteNav } from '@/components/SiteNav';
import { PriceTicker } from '@/components/PriceTicker';
import { FaqAccordion } from '@/components/FaqAccordion';
import { ScentField } from '@/components/ScentField';
import { AmbientVideo } from '@/components/AmbientVideo';
import { Reveal, StaggerGroup, StaggerItem } from '@/components/motion/Reveal';
import { ProductCard } from '@/components/ProductCard';
import { EtalaseCard } from '@/components/EtalaseCard';
import { getFragrances, getBottles, getPackaging, computeDefaultQuote, getFeaturedFragrances } from '@/lib/catalog';
import { getHeroSettings, getFooterSettings, getTestimonials, getFaqItems, getHomepageSettings } from '@/lib/settings';

export const revalidate = 60;

export default async function HomePage() {
  const [fragrances, bottles, packaging, featuredFragrances, hero, footer, testimonials, faqItems, homepage] = await Promise.all([
    getFragrances(),
    getBottles(),
    getPackaging(),
    getFeaturedFragrances(),
    getHeroSettings(),
    getFooterSettings(),
    getTestimonials(),
    getFaqItems(),
    getHomepageSettings(),
  ]);

  const quotedFragrances = fragrances
    .map((f) => ({ fragrance: f, quote: computeDefaultQuote(f, bottles, packaging) }))
    .filter((x): x is { fragrance: typeof fragrances[number]; quote: NonNullable<typeof x.quote> } => x.quote !== null);

  const quotedFeatured = featuredFragrances
    .map((f) => ({ fragrance: f, quote: computeDefaultQuote(f, bottles, packaging) }))
    .filter((x): x is { fragrance: typeof featuredFragrances[number]; quote: NonNullable<typeof x.quote> } => x.quote !== null);

  const featured = quotedFragrances.slice(0, 3);
  const startingPrice = quotedFragrances.length
    ? Math.min(...quotedFragrances.map((x) => x.quote.unitPrice))
    : 23500; // Updated starting price to match user's prompt preference or real catalog

  return (
    <>
      {/* 1. Navbar */}
      <SiteNav />

      {/* 2. Hero */}
      <section className="relative flex min-h-[85vh] items-center overflow-hidden bg-black py-32 text-ivory lg:min-h-0">
        <ScentField />
        <Container className="relative">
          <StaggerGroup mode="mount" className="flex flex-col items-start gap-8" stagger={0.12}>
            <StaggerItem>
              <Badge variant="info">{hero.badge}</Badge>
            </StaggerItem>
            <StaggerItem>
              <h1 className="text-display-1 font-semibold">
                {hero.title}
                <br />
                {hero.subtitle}
              </h1>
            </StaggerItem>
            <StaggerItem>
              <PriceTicker target={startingPrice} />
            </StaggerItem>
            <StaggerItem>
              <p className="text-body-lg max-w-md text-muted-gray">
                {hero.description}
              </p>
            </StaggerItem>
            <StaggerItem>
              <Button intent="primary" size="lg" asChild>
                <a href={hero.ctaLink}>{hero.ctaText}</a>
              </Button>
            </StaggerItem>
          </StaggerGroup>
        </Container>
      </section>

      {/* 3. Starting Price */}
      <section className="border-b border-black-400">
        <Container className="py-8">
          <Stack direction="row" className="items-center justify-between gap-4">
            <span className="text-body">{hero.startingPriceText ?? "Mulai dari"}</span>
            <strong className="text-display-2 text-emerald">Rp{startingPrice.toLocaleString('id-ID')}</strong>
          </Stack>
        </Container>
      </section>

      {/* 4. Fragrances + Showcase */}
      <section id="aroma" className="py-24">
        <Container>
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <SectionHeading
                eyebrow={homepage.collection.eyebrow ?? undefined}
                title={homepage.collection.title}
                description={homepage.collection.description}
              />
              <a href="/aroma" className="text-body text-emerald hover:underline">
                Lihat Semua Aroma →
              </a>
            </div>
          </Reveal>
          <StaggerGroup className="mt-12 grid gap-6 md:grid-cols-3" stagger={0.1}>
            {featured.map(({ fragrance, quote }, i) => (
              <StaggerItem key={fragrance.slug}>
                <ProductCard
                  fragrance={fragrance}
                  bottle={quote.bottle}
                  packaging={quote.packaging}
                  unitPrice={quote.unitPrice}
                  originalUnitPrice={quote.originalUnitPrice}
                  priority={i === 0}
                />
              </StaggerItem>
            ))}
          </StaggerGroup>
          <StaggerGroup className="mt-12 grid gap-6 md:grid-cols-2" stagger={0.12}>
            <StaggerItem className="group relative aspect-[4/5] overflow-hidden rounded-lg">
              <a href="/buat-parfum" className="absolute inset-0 block">
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
              </a>
            </StaggerItem>
            <StaggerItem className="group relative aspect-[4/5] overflow-hidden rounded-lg">
              <a href="/buat-parfum" className="absolute inset-0 block">
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
              </a>
            </StaggerItem>
          </StaggerGroup>

          {/* 4b. Etalase Featured (Homepage Grid) */}
          {quotedFeatured.length > 0 ? (
            <>
              <Reveal className="mt-16">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <SectionHeading
                    eyebrow={homepage.etalase.eyebrow ?? undefined}
                    title={homepage.etalase.title}
                    description={homepage.etalase.description}
                  />
                </div>
              </Reveal>
              <StaggerGroup className="mt-10 grid gap-4 sm:grid-cols-2 md:grid-cols-3" stagger={0.08}>
                {quotedFeatured.map(({ fragrance, quote }) => (
                  <StaggerItem key={fragrance.slug}>
                    <EtalaseCard
                      fragrance={fragrance}
                      bottle={quote.bottle}
                      packaging={quote.packaging}
                      unitPrice={quote.unitPrice}
                    />
                  </StaggerItem>
                ))}
              </StaggerGroup>
              <div className="mt-8 text-center">
                <a href="/aroma" className="text-body font-medium text-emerald hover:underline">
                  Lihat Semua Aroma →
                </a>
              </div>
            </>
          ) : null}
        </Container>
      </section>

      {/* 5. How It Works */}
      <section className="bg-black-600 py-24">
        <Container>
          <Reveal>
            <SectionHeading eyebrow={homepage.howItWorks.eyebrow ?? undefined} title={homepage.howItWorks.title} />
          </Reveal>
          <StaggerGroup className="mt-12 grid gap-6 md:grid-cols-4" stagger={0.08}>
            {(homepage.howItWorks.steps as Array<{ title: string; desc: string }> | Array<[string, string]>).map((s: any, i: number) => {
              const title: string = s.title ?? s[0];
              const desc: string = s.desc ?? s[1];
              return (
              <StaggerItem key={title}>
                <Stack className="gap-2">
                  <span className="text-display-3 text-emerald">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="text-heading-2">{title}</h3>
                  <p className="text-body text-muted-gray">{desc}</p>
                </Stack>
              </StaggerItem>
            )})}
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
                eyebrow={homepage.buildYourPerfume.eyebrow ?? undefined}
                title={homepage.buildYourPerfume.title}
                description={homepage.buildYourPerfume.description}
              />
              <Button intent="primary" size="lg" className="mt-8" asChild>
                <a href={homepage.buildYourPerfume.ctaLink}>{homepage.buildYourPerfume.ctaText}</a>
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
              {homepage.valueBand.title}
            </p>
            <p className="text-body-lg mt-4 text-ivory/80">
              {homepage.valueBand.subtitle}
            </p>
          </Reveal>
        </Container>
      </section>

      {/* 8. Testimonials */}
      <section className="bg-black-600 py-24">
        <Container>
          <Reveal>
            <SectionHeading eyebrow={homepage.testimonial.eyebrow ?? undefined} title={homepage.testimonial.title} />
          </Reveal>
          <StaggerGroup className="mt-12 grid gap-6 md:grid-cols-3" stagger={0.1}>
            {testimonials.map((t) => (
              <StaggerItem key={t.name} className="rounded-lg border border-black-400 p-6">
                <figure>
                  <blockquote className="text-body">"{t.quote}"</blockquote>
                  <figcaption className="text-caption mt-3 text-muted-gray">
                    — {t.name}{t.role ? `, ${t.role}` : ""}
                  </figcaption>
                </figure>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </Container>
      </section>

      {/* 9. FAQ */}
      <section id="faq" className="py-24">
        <Container className="max-w-3xl">
          <Reveal>
            <SectionHeading eyebrow={homepage.faq.eyebrow ?? undefined} title={homepage.faq.title} />
          </Reveal>
          <Reveal delay={0.1} className="mt-12">
            <FaqAccordion items={faqItems} />
          </Reveal>
        </Container>
      </section>

      {/* 10. WhatsApp CTA */}
      <section className="py-24 text-center">
        <Container>
          <Reveal>
            <Stack className="items-center gap-6">
              <h2 className="text-display-3 font-semibold">{homepage.whatsappCta.title}</h2>
              <p className="text-body-lg max-w-md text-muted-gray">
                {homepage.whatsappCta.description}
              </p>
              <Button intent="primary" size="xl" asChild>
                <a href={`https://wa.me/${footer.phone}`} target="_blank" rel="noopener noreferrer">
                  {homepage.whatsappCta.ctaText}
                </a>
              </Button>
            </Stack>
          </Reveal>
        </Container>
      </section>

      {/* 11. Footer */}
      <footer className="border-t border-black-400 py-12">
        <Container>
          <Stack className="gap-4">
            <span className="text-display-3">MIZ</span>
            <p className="text-caption text-muted-gray">
              {footer.copyright.replace("%d", String(new Date().getFullYear()))}
            </p>
            <p className="text-caption text-muted-gray">{footer.address}</p>
            <p className="text-caption text-muted-gray">
              {footer.instagram ? `IG: ${footer.instagram}` : ""}
              {footer.instagram && footer.tiktok ? " · " : ""}
              {footer.tiktok ? `TT: ${footer.tiktok}` : ""}
            </p>
          </Stack>
        </Container>
      </footer>
    </>
  );
}
