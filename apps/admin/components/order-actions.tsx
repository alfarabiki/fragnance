"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { canTransition, type OrderStatus } from "@atlase/domain";
import { Button } from "@/components/ui/button";

// Only the transitions an admin would ever trigger by hand — automatic ones
// (PENDING_PAYMENT → EXPIRED, etc.) come from the payment webhook, not here.
const MANUAL_ACTIONS: { to: OrderStatus; label: string; variant?: "outline" | "destructive" }[] = [
  { to: "CONFIRMED", label: "Konfirmasi" },
  { to: "PAID", label: "Tandai Dibayar" },
  { to: "PROCESSING", label: "Proses" },
  { to: "READY", label: "Siap Kirim" },
  { to: "SHIPPED", label: "Kirim" },
  { to: "COMPLETED", label: "Selesaikan" },
  { to: "CANCELLED", label: "Batalkan", variant: "destructive" },
];

export function OrderActions({ orderId, status }: { orderId: string; status: string }) {
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const available = MANUAL_ACTIONS.filter((a) => canTransition(status as OrderStatus, a.to));
  if (available.length === 0) return null;

  async function transition(toStatus: OrderStatus) {
    setPending(toStatus);
    setError(null);
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toStatus }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error?.message || "Gagal mengubah status.");
        return;
      }
      router.refresh();
    } catch {
      setError("Gagal mengubah status. Periksa koneksi.");
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="flex items-center gap-2">
      {available.map((a) => (
        <Button
          key={a.to}
          size="sm"
          variant={a.variant ?? "outline"}
          disabled={pending !== null}
          onClick={() => transition(a.to)}
        >
          {pending === a.to ? "..." : a.label}
        </Button>
      ))}
      {error ? <span className="text-xs text-destructive">{error}</span> : null}
    </div>
  );
}
