import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground">
          Funnel & performa (docs/analytics.md §56).
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { stage: "Visitors", value: "—" },
          { stage: "Product Views", value: "—" },
          { stage: "Customization", value: "—" },
          { stage: "Cart", value: "—" },
          { stage: "WhatsApp / Payment", value: "—" },
          { stage: "Completed Order", value: "—" },
        ].map((s) => (
          <Card key={s.stage}>
            <CardHeader>
              <CardTitle>{s.stage}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{s.value}</p>
              <CardDescription>
                <Badge variant="secondary">Perlu event tracking</Badge>
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}