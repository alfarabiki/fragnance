// Lightweight, dependency-free guards for public write endpoints (§51/§54).
// ponytail: in-memory rate limit is per-instance only — Vercel serverless can
// run multiple instances, so this is a soft ceiling, not a hard one. Swap for
// Upstash Redis (`@upstash/ratelimit`) once an account exists and traffic
// justifies a shared counter across instances.

const buckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, { max, windowMs }: { max: number; windowMs: number }): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (bucket.count >= max) return false;
  bucket.count += 1;
  return true;
}

export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

// Rejects only when Origin is present and disagrees with Host — same-origin
// browser POSTs and non-browser callers (curl, tests, webhooks) pass through.
export function isCrossOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return false;
  const host = req.headers.get("host");
  try {
    return new URL(origin).host !== host;
  } catch {
    return true;
  }
}
