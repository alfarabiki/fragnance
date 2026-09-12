import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { listPayments } from "@/lib/data";

export const dynamic = "force-dynamic";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive"> = {
  PAID: "default",
  PENDING: "secondary",
  FAILED: "destructive",
  EXPIRED: "destructive",
  REFUNDED: "secondary",
};

export default async function PaymentsPage() {
  const payments = await listPayments();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Payments</h1>
        <p className="text-sm text-muted-foreground">
          Status pembayaran QRIS/Midtrans (§53). Kebenaran status hanya dari webhook — tidak bisa diedit manual di sini.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Semua Transaksi</CardTitle>
          <CardDescription>{payments.length} transaksi.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Metode</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Jumlah</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Dibuat</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    Belum ada transaksi.
                  </TableCell>
                </TableRow>
              ) : (
                payments.map((p) => (
                  <TableRow key={String(p.id)}>
                    <TableCell className="font-medium">{String(p.order_number ?? "—")}</TableCell>
                    <TableCell>{String(p.method)}</TableCell>
                    <TableCell>{String(p.provider)}</TableCell>
                    <TableCell>Rp{Number(p.amount_paid ?? p.amount_requested).toLocaleString("id-ID")}</TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[String(p.status)] ?? "secondary"}>{String(p.status)}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {p.created_at ? new Date(String(p.created_at)).toLocaleString("id-ID") : "—"}
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
