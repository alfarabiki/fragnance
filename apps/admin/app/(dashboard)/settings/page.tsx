import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight capitalize">settings</h1>
        <p className="text-sm text-muted-foreground">Modul settings.</p>
      </div>
      <Card>
        <CardHeader><CardTitle className="capitalize">settings</CardTitle><CardDescription>Modul dikelola di sini.</CardDescription></CardHeader>
        <CardContent className="text-sm text-muted-foreground">Belum ada data.</CardContent>
      </Card>
    </div>
  );
}
