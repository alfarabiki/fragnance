import { PerfumeBuilder } from '@/components/PerfumeBuilder';
import { SiteNav } from '@/components/SiteNav';
import { SectionHeading } from '@atlase/ui';
import { getFragrances, getBottles, getPackaging, getVolumePresets, getAlcoholSellPerMl, getStrengthPresetPercents } from '@/lib/catalog';

export const revalidate = 60;

export const metadata = {
  title: 'Buat Parfum Kamu — Miz',
  description:
    'Pilih aroma, ukuran, dan kekuatan aroma. Harganya langsung berubah. Mulai dari Rp29.000.',
};

export default async function BuatParfumPage() {
  const [fragrances, bottles, packaging, volumePresets, alcoholSellPerMl, strengthPresetPercents] = await Promise.all([
    getFragrances(),
    getBottles(),
    getPackaging(),
    getVolumePresets(),
    getAlcoholSellPerMl(),
    getStrengthPresetPercents(),
  ]);

  return (
    <>
      <SiteNav />
      <main className="min-h-screen bg-black py-16 text-ivory">
        <SectionHeading
          eyebrow="Buat Sendiri"
          title="Buat Parfum Kamu"
          description="Sesuaikan dengan budget kamu. Info langsung berubah."
          className="px-4 sm:px-6"
        />
        <div className="mt-10">
          <PerfumeBuilder
            fragrances={fragrances}
            bottles={bottles}
            packaging={packaging}
            volumePresets={volumePresets}
            alcoholSellPerMl={alcoholSellPerMl}
            strengthPresetPercents={strengthPresetPercents}
          />
        </div>
      </main>
    </>
  );
}
