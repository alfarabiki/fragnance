"use client";

import { useState } from "react";
import { fragrances } from "@atlase/config";
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

export function PricingTierEditor() {
  const [rows, setRows] = useState<EditedFragrance[]>(
    fragrances.map((f) => ({
      id: f.id,
      name: f.name,
      costPerMl: f.costPerMl,
      pricePerMl: f.pricePerMl,
    })),
  );
  const [status, setStatus] = useState<PricingVersionStatus>("DRAFT");
  const [version, setVersion] = useState("v1.1");
  const [notice, setNotice] = useState<string | null>(null);

  function update(id: string, field: "costPerMl" | "pricePerMl", value: number) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
    setStatus("DRAFT");
    setNotice(null);
  }

  function publish(next: PricingVersionStatus, label: string) {
    // In production this persists a new pricing_versions row + fragrance_pricing
    // rows (audit-logged). Without a live DB connection, we record intent locally.
    setStatus(next);
    if (next === "ACTIVE") {
      setVersion(label);
      setNotice("Pricing v" + label + " kini aktif. Harga lama tidak terpengaruh (snapshot dijaga).");
    } else {
      setNotice("Status: " + next);
    }
  }

  const nextLabel = parseInt(version.replace("v", ""), 10) + 1;

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
              <Button size="sm" variant="outline" onClick={() => publish("PREVIEW", version)}>
                Preview
              </Button>
              <Button
                size="sm"
                onClick={() => publish("ACTIVE", "v" + nextLabel)}
              >
                Publish v{nextLabel}
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