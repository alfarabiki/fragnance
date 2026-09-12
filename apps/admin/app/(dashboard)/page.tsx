import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { listOrders, getDashboardStats } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [orders, dashboardStats] = await Promise.all([listOrders(), getDashboardStats()]);
  const stats = [
    { label: "Total Pesanan", value: String(dashboardStats.totalOrders), hint: "Semua waktu" },
    { label: "Pendapatan", value: `Rp${dashboardStats.revenuePaid.toLocaleString("id-ID")}`, hint: "Order dibayar" },
    { label: "Pelanggan", value: String(dashboardStats.totalCustomers), hint: "Terdaftar" },
    { label: "WhatsApp", value: String(dashboardStats.whatsappOrders), hint: "Channel" },
  ];
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Ringkasan aktivitas platform.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader>
              <CardDescription>{s.label}</CardDescription>
              <CardTitle>{s.value}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">{s.hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pesanan Terbaru</CardTitle>
          <CardDescription>Order terakhir yang masuk.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    Belum ada pesanan.
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-medium">{o.order_number}</TableCell>
                    <TableCell>{o.customer_id ?? "Anonim"}</TableCell>
                    <TableCell>
                      <Badge variant={o.status === "PAID" ? "default" : "secondary"}>
                        {o.status ?? "DRAFT"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {o.total != null ? `Rp${o.total.toLocaleString("id-ID")}` : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" render={
                        <a href={`/orders/${o.order_number}`} />
                      }>
                        Detail
                      </Button>
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