import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FragranceManager } from "@/components/fragrance-manager";
import { listFragrances } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function FragrancesPage() {
  const fragranceRows = await listFragrances();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Fragrances</h1>
        <p className="text-sm text-muted-foreground">
          Kelola nama, harga, deskripsi, foto, dan video tiap aroma.
        </p>
      </div>

      {fragranceRows.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Belum ada data</CardTitle>
            <CardDescription>
              Database belum terhubung, atau belum ada fragrance tersimpan.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Set SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY, lalu jalankan seed catalog.
          </CardContent>
        </Card>
      ) : (
        <FragranceManager
          initial={fragranceRows.map((f) => ({
            id: String(f.id),
            name: String(f.name ?? ""),
            description: f.description ? String(f.description) : null,
            category: f.category ? String(f.category) : null,
            min_ml: f.min_ml != null ? Number(f.min_ml) : null,
            max_ml: f.max_ml != null ? Number(f.max_ml) : null,
            cost_per_ml: f.cost_per_ml != null ? Number(f.cost_per_ml) : null,
            price_per_ml: f.price_per_ml != null ? Number(f.price_per_ml) : null,
            is_active: Boolean(f.is_active),
            image_url: f.image_url ? String(f.image_url) : null,
            video_url: f.video_url ? String(f.video_url) : null,
          }))}
        />
      )}
    </div>
  );
}
