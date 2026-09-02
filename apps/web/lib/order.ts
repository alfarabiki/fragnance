export function generateOrderNumber(now: Date = new Date()): string {
  const y = String(now.getFullYear()).slice(-2);
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");

  let seq = 1;
  const today = y + m + d;
  const raw = localStorage.getItem("atlase.order.seq");
  if (raw) {
    const [lastDate, lastSeq] = raw.split(":");
    seq = lastDate === today ? Number(lastSeq) + 1 : 1;
  }
  localStorage.setItem("atlase.order.seq", `${today}:${seq}`);
  return `ATL-${today}-${String(seq).padStart(6, "0")}`;
}