const { withSentryConfig } = require("@sentry/nextjs/config");

const isDev = process.env.NODE_ENV !== "production";

// connect-src needs Supabase (fetch + realtime) and Sentry ingest (harmless
// if SENTRY_DSN is unset — the SDK just never calls out).
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.sentry.io https://*.ingest.sentry.io",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig = {
  transpilePackages: [
    "@atlase/ui",
    "@atlase/domain",
    "@atlase/config",
    "@atlase/pricing",
    "@atlase/types",
  ],
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

// Only wrap with Sentry's webpack plugin once org/project are set — without
// them the plugin still tries to talk to the Sentry API during build/dev and
// hangs (`silent: true` doesn't stop that). Runtime SDK init (sentry.*.config.ts)
// stays no-op-safe on its own via the SENTRY_DSN check inside each file.
const sentryConfigured = Boolean(process.env.SENTRY_ORG && process.env.SENTRY_PROJECT);

module.exports = sentryConfigured
  ? withSentryConfig(nextConfig, {
      silent: true,
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
    })
  : nextConfig;
