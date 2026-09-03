import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PackagingManager } from "@/components/packaging-manager";
import { listPackaging } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function PackagingPage() {
  const rows = await listPackaging();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Packaging</h1>
        <p className="text-sm text-muted-foreground">Kelola nama, deskripsi, harga, dan stok tiap packaging.</p>
      </div>

      {rows.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Belum ada data</CardTitle>
            <CardDescription>Database belum terhubung, atau belum ada packaging tersimpan.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Set SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY, lalu jalankan seed catalog.
          </CardContent>
        </Card>
      ) : (
        <PackagingManager
          initial={rows.map((p) => ({
            id: String(p.id),
            name: String(p.name ?? ""),
            description: p.description ? String(p.description) : null,
            cost_price: p.cost_price != null ? Number(p.cost_price) : null,
            sell_price: p.sell_price != null ? Number(p.sell_price) : null,
            is_mandatory: Boolean(p.is_mandatory),
            is_active: Boolean(p.is_active),
            current_stock: p.current_stock != null ? Number(p.current_stock) : 0,
          }))}
        />
      )}
    </div>
  );
}
