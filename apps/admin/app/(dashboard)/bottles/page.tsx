import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight capitalize">bottles</h1>
        <p className="text-sm text-muted-foreground">Modul bottles.</p>
      </div>
      <Card>
        <CardHeader><CardTitle className="capitalize">bottles</CardTitle><CardDescription>Modul dikelola di sini.</CardDescription></CardHeader>
        <CardContent className="text-sm text-muted-foreground">Belum ada data.</CardContent>
      </Card>
    </div>
  );
}
