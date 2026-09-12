"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function WhatsappActions({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  if (status !== "NOT_SENT") return null;

  async function markSent() {
    setPending(true);
    try {
      await fetch(`/api/whatsapp/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "SENT" }),
      });
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <Button size="sm" variant="outline" disabled={pending} onClick={markSent}>
      {pending ? "..." : "Tandai Terkirim"}
    </Button>
  );
}
