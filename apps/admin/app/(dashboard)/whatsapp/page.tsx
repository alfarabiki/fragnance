import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { listWhatsappOrders } from "@/lib/data";
import { WhatsappActions } from "@/components/whatsapp-actions";

export const dynamic = "force-dynamic";

export default async function WhatsappPage() {
  const rows = await listWhatsappOrders();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">WhatsApp Orders</h1>
        <p className="text-sm text-muted-foreground">Atribusi order via channel WhatsApp (§98).</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Semua Order WhatsApp</CardTitle>
          <CardDescription>{rows.length} order.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Dibuat</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    Belum ada order WhatsApp.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((w) => (
                  <TableRow key={String(w.id)}>
                    <TableCell className="font-medium">{String(w.order_number ?? "—")}</TableCell>
                    <TableCell>Rp{Number(w.order_total ?? 0).toLocaleString("id-ID")}</TableCell>
                    <TableCell>
                      <Badge variant={w.status === "NOT_SENT" ? "secondary" : "default"}>{String(w.status)}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {w.created_at ? new Date(String(w.created_at)).toLocaleString("id-ID") : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <WhatsappActions id={String(w.id)} status={String(w.status)} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
