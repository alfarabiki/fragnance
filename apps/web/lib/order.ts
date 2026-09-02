// ponytail: random suffix instead of a stateful sequence — this runs both in
// the browser (checkout preview) and on the server (route handler), and a
// serverless API route has no shared counter to increment safely across
// instances. 1M combinations per day per digit-count is enough collision
// margin for MVP volume; the DB's unique constraint on order_number is the
// real backstop if it ever collides.
export function generateOrderNumber(now: Date = new Date()): string {
  const y = String(now.getFullYear()).slice(-2);
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const today = y + m + d;
  const suffix = String(Math.floor(Math.random() * 1_000_000)).padStart(6, "0");
  return `ATL-${today}-${suffix}`;
}
