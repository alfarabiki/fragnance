import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { PerfumeBuilder } from '@/components/PerfumeBuilder';
import { SiteNav } from '@/components/SiteNav';
import { Container, Stack, Badge } from '@atlase/ui';
import { getFragranceBySlug, getFragrances, getBottles, getPackaging, volumePresets, alcoholSellPerMl } from '@/lib/catalog';

type Params = { slug: string };

// Dynamic + short-lived cache instead of generateStaticParams/SSG: the
// catalog now lives in Supabase and admin edits (price, discount, stock)
// should show up without a redeploy.
export const revalidate = 60;
export const dynamicParams = true;

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const fragrance = await getFragranceBySlug(slug);
  if (!fragrance) return {};

  const title = `${fragrance.name} — Parfum Custom | Miz`;
  const description = `${fragrance.description}. ${fragrance.detail} Mulai dari Rp${fragrance.pricePerMl.toLocaleString('id-ID')}/ml, bisa kamu sesuaikan sendiri.`;
  const canonical = `/produk/${fragrance.slug}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'website',
    },
  };
}

export default async function ProdukPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const [fragrance, fragrances, bottles, packaging] = await Promise.all([
    getFragranceBySlug(slug),
    getFragrances(),
    getBottles(),
    getPackaging(),
  ]);
  if (!fragrance) notFound();

  return (
    <>
      <SiteNav />
      <main className="min-h-screen bg-black py-16 text-ivory">
        <Container>
          <Stack className="gap-6">
            <div>
              <Badge variant="info">{fragrance.category}</Badge>
              <h1 className="text-display-2 mt-3 font-semibold">{fragrance.name}</h1>
              <p className="text-body-lg mt-2 text-muted-gray">{fragrance.description}</p>
              <p className="text-body mt-2 max-w-lg text-muted-gray">{fragrance.detail}</p>
            </div>
            <div className="text-body-sm text-muted-gray">
              {fragrance.referenceLabel}. Harga per ml Rp
              {fragrance.pricePerMl.toLocaleString('id-ID')}.
            </div>
          </Stack>
        </Container>
        <div className="mt-10">
          <PerfumeBuilder
            fragrances={fragrances}
            bottles={bottles}
            packaging={packaging}
            volumePresets={volumePresets}
            alcoholSellPerMl={alcoholSellPerMl}
            initialSlug={slug}
          />
        </div>
      </main>
    </>
  );
}
