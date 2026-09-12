"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface SettingRow {
  key: string;
  value: unknown;
}

export function SettingsManager({ initial }: { initial: SettingRow[] }) {
  const [rows, setRows] = useState(initial);
  const [newKey, setNewKey] = useState("");

  function addRow() {
    if (!newKey.trim() || rows.some((r) => r.key === newKey)) return;
    setRows((prev) => [...prev, { key: newKey, value: "" }]);
    setNewKey("");
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {rows.map((r) => (
        <SettingCard key={r.key} setting={r} />
      ))}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tambah Setting</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Input value={newKey} onChange={(e) => setNewKey(e.target.value)} placeholder="mis. alcohol_price_per_ml" />
          <Button variant="outline" onClick={addRow}>
            Tambah
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function SettingCard({ setting }: { setting: SettingRow }) {
  const [value, setValue] = useState(JSON.stringify(setting.value ?? null, null, 2));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function save() {
    let parsed: unknown;
    try {
      parsed = JSON.parse(value);
    } catch {
      setMessage("Value harus JSON valid (mis. angka, string berkutip, atau objek).");
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: setting.key, value: parsed }),
      });
      const data = await res.json();
      setMessage(res.ok ? "Tersimpan." : data?.error?.message || "Gagal menyimpan.");
    } catch {
      setMessage("Gagal menyimpan. Periksa koneksi.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-mono">{setting.key}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Label className="text-xs text-muted-foreground">Value (JSON)</Label>
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={3}
          className="w-full rounded-md border border-input bg-transparent px-3 py-2 font-mono text-sm"
        />
        <div className="flex items-center justify-between gap-3">
          <Button size="sm" onClick={save} disabled={saving}>
            {saving ? "Menyimpan..." : "Simpan"}
          </Button>
          {message ? <span className="text-xs text-muted-foreground">{message}</span> : null}
        </div>
      </CardContent>
    </Card>
  );
}
