import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getOrderDetail } from "@/lib/data";
import { OrderActions } from "@/components/order-actions";

export const dynamic = "force-dynamic";

function rupiah(n: number | null | undefined): string {
  return `Rp${Number(n ?? 0).toLocaleString("id-ID")}`;
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ order_number: string }>;
}) {
  const { order_number } = await params;
  const order = await getOrderDetail(order_number);
  if (!order) notFound();

  const customization = order.customizations[0] as Record<string, unknown> | undefined;
  const address = order.address as Record<string, unknown> | null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{order.order_number}</h1>
          <p className="text-sm text-muted-foreground">
            Dibuat {order.created_at ? new Date(order.created_at).toLocaleString("id-ID") : "—"} · Channel{" "}
            {order.channel ?? "WHATSAPP"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={order.status === "PAID" || order.status === "COMPLETED" ? "default" : "secondary"}>
            {order.status}
          </Badge>
          <OrderActions orderId={order.id} status={order.status ?? "DRAFT"} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Pelanggan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p className="font-medium">{order.customer?.name ?? "Anonim"}</p>
            <p className="text-muted-foreground">{order.customer?.phone ?? "—"}</p>
            <p className="text-muted-foreground">{order.customer?.email ?? ""}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alamat</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            {address ? (
              <>
                <p className="font-medium">{String(address.recipient_name)} · {String(address.phone)}</p>
                <p className="text-muted-foreground">{String(address.full_address)}</p>
                <p className="text-muted-foreground">
                  {String(address.district)}, {String(address.city)}, {String(address.province)}{" "}
                  {String(address.postal_code)}
                </p>
              </>
            ) : (
              <p className="text-muted-foreground">Belum ada alamat.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Produk & Kustomisasi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {order.items.map((item) => (
            <div key={String(item.id)} className="flex items-center justify-between border-b border-border py-2 last:border-0">
              <span>{String(item.name_snapshot)} × {String(item.quantity)}</span>
              <span className="font-medium">{rupiah(Number(item.line_total))}</span>
            </div>
          ))}
          {customization ? (
            <p className="pt-2 text-xs text-muted-foreground">
              {String(customization.volume_ml)} ml · aroma {String(customization.fragrance_ml)} ml · alkohol{" "}
              {String(customization.alcohol_ml)} ml
            </p>
          ) : null}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ringkasan Harga</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5 text-sm">
            <Row label="Subtotal" value={rupiah(order.subtotal)} />
            <Row label="Diskon" value={`-${rupiah(order.discount)}`} />
            <Row label="Ongkir" value={rupiah(order.shipping)} />
            <Row label="Total" value={rupiah(order.total)} strong />
            <p className="pt-1 text-xs text-muted-foreground">
              Pricing version: {order.pricing_version_label ?? "—"} · Payment: {order.payment_status ?? "—"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pembayaran</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {order.payments.length === 0 ? (
              <p className="text-muted-foreground">Belum ada transaksi pembayaran.</p>
            ) : (
              order.payments.map((p) => (
                <div key={String(p.id)} className="flex items-center justify-between border-b border-border py-2 last:border-0">
                  <span>{String(p.method)} · {String(p.provider)}</span>
                  <div className="text-right">
                    <Badge variant={p.status === "PAID" ? "default" : "secondary"}>{String(p.status)}</Badge>
                    <p className="text-xs text-muted-foreground">{rupiah(Number(p.amount_requested))}</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Timeline</CardTitle>
          <CardDescription>Riwayat perubahan status order.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {order.events.length === 0 ? (
            <p className="text-muted-foreground">Belum ada event.</p>
          ) : (
            order.events.map((e) => (
              <div key={String(e.id)} className="flex items-center justify-between border-b border-border py-2 last:border-0">
                <span>
                  {e.from_status ? `${String(e.from_status)} → ` : ""}
                  {String(e.to_status ?? e.event_type)}
                </span>
                <span className="text-xs text-muted-foreground">
                  {e.created_at ? new Date(String(e.created_at)).toLocaleString("id-ID") : ""}
                </span>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={strong ? "font-medium" : "text-muted-foreground"}>{label}</span>
      <span className={strong ? "font-semibold" : ""}>{value}</span>
    </div>
  );
}
