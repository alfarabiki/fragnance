import { PerfumeBuilder } from '@/components/PerfumeBuilder';
import { SiteNav } from '@/components/SiteNav';
import { SectionHeading } from '@atlase/ui';

export const metadata = {
  title: 'Buat Parfum Kamu — ATLASE',
  description:
    'Pilih aroma, ukuran, dan kekuatan aroma. Harganya langsung berubah. Mulai dari Rp29.000.',
};

export default function BuatParfumPage() {
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
          <PerfumeBuilder />
        </div>
      </main>
    </>
  );
}
