import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default function PromotionsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Promotions</h1>
          <p className="text-sm text-muted-foreground">
            Kupon dan diskon (P1).
          </p>
        </div>
        <Button>Buat Promo</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Promosi</CardTitle>
          <CardDescription>Belum ada promosi aktif.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Promosi tipe persen/fixed dengan minimal order dan rentang tanggal
          akan dikelola di sini (server-side pricing, docs/pricing.md §5).
        </CardContent>
      </Card>
    </div>
  );
}