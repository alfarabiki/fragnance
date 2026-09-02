// Client-side funnel tracking (§56). Fire-and-forget — never blocks the UI,
// never throws into the caller. A random per-browser session id (not tied to
// identity) groups events until an order links them to a real customer.

const SESSION_KEY = "atlase.analytics.session";

function sessionId(): string {
  if (typeof window === "undefined") return "server";
  let id = window.localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    window.localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export function track(eventType: string, metadata?: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  fetch("/api/analytics/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ eventType, sessionId: sessionId(), metadata }),
    keepalive: true,
  }).catch(() => {
    // Analytics must never break the customer flow.
  });
}
