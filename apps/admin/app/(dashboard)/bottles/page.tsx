import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BottleManager } from "@/components/bottle-manager";
import { listBottles } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function BottlesPage() {
  const rows = await listBottles();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Bottles</h1>
        <p className="text-sm text-muted-foreground">Kelola nama, volume, harga, dan stok tiap botol.</p>
      </div>

      {rows.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Belum ada data</CardTitle>
            <CardDescription>Database belum terhubung, atau belum ada botol tersimpan.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Set SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY, lalu jalankan seed catalog.
          </CardContent>
        </Card>
      ) : (
        <BottleManager
          initial={rows.map((b) => ({
            id: String(b.id),
            name: String(b.name ?? ""),
            volume_ml: b.volume_ml != null ? Number(b.volume_ml) : null,
            cost_price: b.cost_price != null ? Number(b.cost_price) : null,
            sell_price: b.sell_price != null ? Number(b.sell_price) : null,
            is_active: Boolean(b.is_active),
            current_stock: b.current_stock != null ? Number(b.current_stock) : 0,
          }))}
        />
      )}
    </div>
  );
}
