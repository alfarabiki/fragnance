import { listPromotions } from "@/lib/data";
import { PromotionManager, type PromotionRow } from "@/components/promotion-manager";

export const dynamic = "force-dynamic";

export default async function PromotionsPage() {
  const rows = await listPromotions();
  const promotions: PromotionRow[] = rows.map((p) => ({
    id: String(p.id),
    name: String(p.name),
    type: p.type as "PERCENTAGE" | "FIXED",
    value: Number(p.value),
    min_order: Number(p.min_order),
    coupon_code: (p.coupon_code as string) ?? null,
    starts_at: (p.starts_at as string) ?? null,
    ends_at: (p.ends_at as string) ?? null,
    is_active: Boolean(p.is_active),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Promotions</h1>
        <p className="text-sm text-muted-foreground">
          Kupon dan diskon persen/fixed dengan minimal order (§80). Kalkulasi diterapkan server-side saat checkout.
        </p>
      </div>

      <PromotionManager initial={promotions} />
    </div>
  );
}
