import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { listBottles, listPackaging } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  const [bottleRows, packagingRows] = await Promise.all([listBottles(), listPackaging()]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Inventory</h1>
        <p className="text-sm text-muted-foreground">
          Stok botol dan packaging saat ini. Untuk mengubah stok, buka halaman Bottles / Packaging.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Botol</CardTitle>
          <CardDescription>Stok saat ini.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Volume</TableHead>
                <TableHead>Stok</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bottleRows.map((b) => {
                const stock = Number(b.current_stock ?? 0);
                return (
                  <TableRow key={String(b.id)}>
                    <TableCell className="font-medium">{String(b.name)}</TableCell>
                    <TableCell>{String(b.volume_ml)} ml</TableCell>
                    <TableCell>{stock}</TableCell>
                    <TableCell>
                      {stock > 0 ? <Badge variant="default">Tersedia</Badge> : <Badge variant="destructive">Habis</Badge>}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Packaging</CardTitle>
          <CardDescription>Stok saat ini.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Stok</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {packagingRows.map((p) => {
                const stock = Number(p.current_stock ?? 0);
                return (
                  <TableRow key={String(p.id)}>
                    <TableCell className="font-medium">{String(p.name)}</TableCell>
                    <TableCell>{stock}</TableCell>
                    <TableCell>
                      {stock > 0 ? <Badge variant="default">Tersedia</Badge> : <Badge variant="destructive">Habis</Badge>}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}