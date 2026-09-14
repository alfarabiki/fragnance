import type { Metadata } from "next";
import { SiteNav } from "@/components/SiteNav";
import { Container, SectionHeading } from "@atlase/ui";
import { AromaGrid, type AromaGridEntry } from "@/components/AromaGrid";
import { getFragrances, getBottles, getPackaging, computeDefaultQuote } from "@/lib/catalog";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Aroma Parfum Lengkap - Miz Parfume Padang | 100+ Pilihan",
  description:
    "Pilihan aroma parfum lengkap di Padang. 100+ aroma parfum pria, wanita, dan unisex. Pilih aroma favorit Anda, custom sesuai selera, harga bersahabat.",
  keywords: [
    "aroma parfum",
    "pilihan aroma parfum",
    "parfum berbagai aroma",
    "aroma parfum pria",
    "aroma parfum wanita",
    "parfum Padang",
    "Miz Parfume",
  ],
  alternates: { canonical: "/aroma" },
  openGraph: {
    title: "Aroma Parfum Lengkap - Miz Parfume Padang | 100+ Pilihan",
    description: "Pilihan aroma parfum lengkap. 100+ aroma parfum pria, wanita, dan unisex di Padang.",
    url: "https://mizparfume.com/aroma",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function AromaPage() {
  const [fragrances, bottles, packaging] = await Promise.all([
    getFragrances(),
    getBottles(),
    getPackaging(),
  ]);

  const entries: AromaGridEntry[] = fragrances
    .map((fragrance) => ({ fragrance, quote: computeDefaultQuote(fragrance, bottles, packaging) }))
    .filter((x): x is { fragrance: typeof fragrances[number]; quote: NonNullable<typeof x.quote> } => x.quote !== null)
    .map(({ fragrance, quote }) => ({
      fragrance,
      bottle: quote.bottle,
      packaging: quote.packaging,
      unitPrice: quote.unitPrice,
    }));

  return (
    <>
      <SiteNav />
      <main className="bg-black py-16 text-ivory">
        <Container>
          <SectionHeading
            eyebrow="Koleksi Lengkap"
            title="Semua Aroma"
            description={`${entries.length} aroma tersedia. Pilih favoritmu, atur sendiri kekuatannya.`}
          />
          <div className="mt-10">
            <AromaGrid entries={entries} />
          </div>
        </Container>
      </main>
    </>
  );
}
