import * as Sentry from "@sentry/nextjs";

// No-op until SENTRY_DSN is set — safe to ship without an account yet.
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 0.1,
  });
}
