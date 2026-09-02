import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PricingSimulator } from "@/components/pricing-simulator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fragrances, bottles, packaging } from "@atlase/config";

export const dynamic = "force-dynamic";

export default function PricingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Pricing</h1>
        <p className="text-sm text-muted-foreground">
          Kelola harga per ml, cost, botol, dan packaging.
        </p>
      </div>

      <Tabs defaultValue="simulator">
        <TabsList>
          <TabsTrigger value="simulator">Simulator</TabsTrigger>
          <TabsTrigger value="fragrance">Fragrance</TabsTrigger>
          <TabsTrigger value="catalog">Botol & Packaging</TabsTrigger>
        </TabsList>

        <TabsContent value="simulator" className="pt-4">
          <PricingSimulator />
        </TabsContent>

        <TabsContent value="fragrance" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Harga Fragrance per ml</CardTitle>
              <CardDescription>Versi v1.0 (ACTIVE)</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Cost/ml</TableHead>
                    <TableHead>Jual/ml</TableHead>
                    <TableHead>Min–Max</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fragrances.map((f) => (
                    <TableRow key={f.id}>
                      <TableCell className="font-medium">{f.name}</TableCell>
                      <TableCell>{f.category}</TableCell>
                      <TableCell>Rp{f.costPerMl}</TableCell>
                      <TableCell className="font-semibold">Rp{f.pricePerMl}</TableCell>
                      <TableCell>{f.minMl}–{f.maxMl} ml</TableCell>
                      <TableCell>
                        {f.isActive ? <Badge variant="default">Aktif</Badge> : <Badge variant="secondary">Nonaktif</Badge>}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="catalog" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Botol</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>Volume</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Jual</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bottles.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell className="font-medium">{b.name}</TableCell>
                      <TableCell>{b.volumeMl} ml</TableCell>
                      <TableCell>Rp{b.costPrice}</TableCell>
                      <TableCell>Rp{b.sellPrice}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Packaging</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Jual</TableHead>
                    <TableHead>Wajib</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {packaging.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell>Rp{p.costPrice}</TableCell>
                      <TableCell>Rp{p.sellPrice}</TableCell>
                      <TableCell>{p.isMandatory ? "Ya" : "Tidak"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}