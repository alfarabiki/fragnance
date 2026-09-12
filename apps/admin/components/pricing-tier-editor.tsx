"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type PricingVersionStatus = "DRAFT" | "PREVIEW" | "ACTIVE";

type EditedFragrance = {
  id: string;
  name: string;
  costPerMl: number;
  pricePerMl: number;
};

export function PricingTierEditor({
  initial,
  activeVersionLabel,
}: {
  initial: EditedFragrance[];
  activeVersionLabel: string;
}) {
  const router = useRouter();
  const [rows, setRows] = useState<EditedFragrance[]>(initial);
  const [status, setStatus] = useState<PricingVersionStatus>("ACTIVE");
  const [version, setVersion] = useState(activeVersionLabel);
  const [notice, setNotice] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);

  function update(id: string, field: "costPerMl" | "pricePerMl", value: number) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
    setStatus("DRAFT");
    setNotice(null);
  }

  function preview() {
    setStatus("PREVIEW");
    setNotice(`Preview: ${rows.length} aroma akan dipublish dengan harga baru di atas.`);
  }

  async function publish() {
    setPublishing(true);
    setNotice(null);
    try {
      const res = await fetch("/api/pricing/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rows: rows.map((r) => ({ fragranceId: r.id, costPerMl: r.costPerMl, pricePerMl: r.pricePerMl })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setNotice(data?.error?.message || "Gagal publish.");
        return;
      }
      setStatus("ACTIVE");
      setVersion(data.version.label);
      setNotice(`Pricing ${data.version.label} kini aktif. Harga lama tidak terpengaruh (snapshot dijaga).`);
      router.refresh();
    } catch {
      setNotice("Gagal publish. Periksa koneksi.");
    } finally {
      setPublishing(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Versi Pricing</CardTitle>
              <CardDescription>
                {version}{" "}
                <Badge
                  variant={
                    status === "ACTIVE" ? "default" : status === "PREVIEW" ? "secondary" : "outline"
                  }
                >
                  {status}
                </Badge>
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={preview} disabled={publishing}>
                Preview
              </Button>
              <Button size="sm" onClick={publish} disabled={publishing}>
                {publishing ? "Publishing..." : "Publish"}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {notice ? <p className="mb-3 text-sm text-muted-foreground">{notice}</p> : null}
          <div className="grid gap-3">
            {rows.map((r) => (
              <div key={r.id} className="flex items-end gap-3 rounded-lg border p-3">
                <div className="flex-1">
                  <Label>{r.name}</Label>
                </div>
                <div className="w-28">
                  <Label className="text-xs">Cost/ml</Label>
                  <Input
                    type="number"
                    min={0}
                    value={r.costPerMl}
                    onChange={(e) => update(r.id, "costPerMl", Number(e.target.value))}
                  />
                </div>
                <div className="w-28">
                  <Label className="text-xs">Jual/ml</Label>
                  <Input
                    type="number"
                    min={0}
                    value={r.pricePerMl}
                    onChange={(e) => update(r.id, "pricePerMl", Number(e.target.value))}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
