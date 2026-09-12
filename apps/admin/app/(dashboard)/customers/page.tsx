import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { listCustomers } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const customers = await listCustomers();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Customers</h1>
        <p className="text-sm text-muted-foreground">Profil pelanggan terpusat (§9).</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Semua Pelanggan</CardTitle>
          <CardDescription>{customers.length} pelanggan terdaftar.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Kontak</TableHead>
                <TableHead>Pesanan</TableHead>
                <TableHead>Total Belanja</TableHead>
                <TableHead>Order Terakhir</TableHead>
                <TableHead>Marketing</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    Belum ada pelanggan.
                  </TableCell>
                </TableRow>
              ) : (
                customers.map((c) => (
                  <TableRow key={String(c.id)}>
                    <TableCell className="font-medium">{String(c.name ?? "Anonim")}</TableCell>
                    <TableCell>
                      <div>{String(c.phone)}</div>
                      {c.email ? <div className="text-xs text-muted-foreground">{String(c.email)}</div> : null}
                    </TableCell>
                    <TableCell>{String(c.order_count)}</TableCell>
                    <TableCell>Rp{Number(c.total_spend).toLocaleString("id-ID")}</TableCell>
                    <TableCell>
                      {c.last_order_at ? new Date(String(c.last_order_at)).toLocaleDateString("id-ID") : "—"}
                    </TableCell>
                    <TableCell>
                      {c.is_marketing_consent ? (
                        <Badge variant="default">Ya</Badge>
                      ) : (
                        <Badge variant="secondary">Tidak</Badge>
                      )}
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
