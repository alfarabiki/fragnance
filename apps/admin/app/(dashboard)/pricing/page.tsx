import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PricingSimulator } from "@/components/pricing-simulator";
import { PricingTierEditor } from "@/components/pricing-tier-editor";
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
import { listFragrances, listBottles, listPackaging, getActivePricingVersion } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function PricingPage() {
  const [fragranceRows, bottleRows, packagingRows, activeVersion] = await Promise.all([
    listFragrances(),
    listBottles(),
    listPackaging(),
    getActivePricingVersion(),
  ]);

  const simFragrances = fragranceRows.map((f) => ({
    id: String(f.id),
    name: String(f.name),
    pricePerMl: Number(f.price_per_ml),
    costPerMl: Number(f.cost_per_ml),
    minMl: Number(f.min_ml),
    maxMl: Number(f.max_ml),
  }));
  const simBottles = bottleRows.map((b) => ({
    id: String(b.id),
    name: String(b.name),
    volumeMl: Number(b.volume_ml),
    costPrice: Number(b.cost_price),
    sellPrice: Number(b.sell_price),
    isActive: Boolean(b.is_active),
  }));
  const simPackaging = packagingRows.map((p) => ({
    id: String(p.id),
    name: String(p.name),
    costPrice: Number(p.cost_price),
    sellPrice: Number(p.sell_price),
    isMandatory: Boolean(p.is_mandatory),
    isActive: Boolean(p.is_active),
  }));
  const editorRows = fragranceRows.map((f) => ({
    id: String(f.id),
    name: String(f.name),
    costPerMl: Number(f.cost_per_ml),
    pricePerMl: Number(f.price_per_ml),
  }));

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
          <TabsTrigger value="versions">Versi Pricing</TabsTrigger>
        </TabsList>

        <TabsContent value="simulator" className="pt-4">
          <PricingSimulator fragrances={simFragrances} bottles={simBottles} packaging={simPackaging} />
        </TabsContent>

        <TabsContent value="versions" className="pt-4">
          <PricingTierEditor initial={editorRows} activeVersionLabel={activeVersion?.label ?? "v1.0"} />
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
                  {fragranceRows.map((f) => (
                    <TableRow key={String(f.id)}>
                      <TableCell className="font-medium">{String(f.name)}</TableCell>
                      <TableCell>{String(f.category ?? "")}</TableCell>
                      <TableCell>Rp{Number(f.cost_per_ml).toLocaleString("id-ID")}</TableCell>
                      <TableCell className="font-semibold">Rp{Number(f.price_per_ml).toLocaleString("id-ID")}</TableCell>
                      <TableCell>{String(f.min_ml)}–{String(f.max_ml)} ml</TableCell>
                      <TableCell>
                        {f.is_active ? <Badge variant="default">Aktif</Badge> : <Badge variant="secondary">Nonaktif</Badge>}
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
                  {bottleRows.map((b) => (
                    <TableRow key={String(b.id)}>
                      <TableCell className="font-medium">{String(b.name)}</TableCell>
                      <TableCell>{String(b.volume_ml)} ml</TableCell>
                      <TableCell>Rp{Number(b.cost_price).toLocaleString("id-ID")}</TableCell>
                      <TableCell>Rp{Number(b.sell_price).toLocaleString("id-ID")}</TableCell>
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
                  {packagingRows.map((p) => (
                    <TableRow key={String(p.id)}>
                      <TableCell className="font-medium">{String(p.name)}</TableCell>
                      <TableCell>Rp{Number(p.cost_price).toLocaleString("id-ID")}</TableCell>
                      <TableCell>Rp{Number(p.sell_price).toLocaleString("id-ID")}</TableCell>
                      <TableCell>{p.is_mandatory ? "Ya" : "Tidak"}</TableCell>
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