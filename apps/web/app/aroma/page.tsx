import type { Metadata } from "next";
import { SiteNav } from "@/components/SiteNav";
import { Container, SectionHeading } from "@atlase/ui";
import { AromaGrid, type AromaGridEntry } from "@/components/AromaGrid";
import { getFragrances, getBottles, getPackaging, computeDefaultQuote } from "@/lib/catalog";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Semua Aroma — Miz",
  description: "Semua koleksi parfum Miz. Pilih aroma, atur sendiri wanginya.",
  alternates: { canonical: "/aroma" },
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
