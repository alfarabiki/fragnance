import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAnalyticsFunnel } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const funnel = await getAnalyticsFunnel();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground">
          Funnel konversi dari analytics_events (§56). Landing/product-view/customization belum di-instrument di storefront.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {funnel.map((s) => (
          <Card key={s.stage}>
            <CardHeader>
              <CardTitle>{s.stage}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{s.value.toLocaleString("id-ID")}</p>
              <CardDescription>Total event</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
