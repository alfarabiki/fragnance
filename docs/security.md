# ATLASE Security Documentation

## 1. Threat Model

### Threat Actors

| Actor | Capability | Motivation |
|---|---|---|
| **Malicious customer** | Authenticated user, can place orders, submit webhooks via shared Midtrans credentials | Price manipulation, order fraud, payment bypass |
| **Competitor / scraper** | Unauthenticated, automated tooling | Price scraping, catalog cloning |
| **Compromised admin account** | Session hijack or credential theft on admin panel | Data exfiltration, order tampering, privilege escalation |
| **Insider (lower-privileged staff)** | Legitimate admin credentials with limited RBAC scope | Unauthorized data access, audit log tampering |
| **Automated bot** | Distributed requests, no credential | Credential stuffing, bulk order abuse, inventory hoarding |
| **Compromised third-party** | Midtrans webhook forgery, DNS hijack | Payment confirmation spoofing, revenue theft |

### Protected Assets

| Asset | Sensitivity | Rationale |
|---|---|---|
| **Product prices & pricing rules** | High | Server-side only; exposure allows undercutting and manipulation |
| **Order data** | High | Contains PII + financial records; Indonesian tax compliance |
| **Payment records** | Critical | Midtrans server key, transaction details, reconciliation data |
| **Customer PII** | Critical | Names, phone numbers, addresses — subject to UU PDP |
| **Admin access / session tokens** | Critical | Full platform control if compromised |
| **Webhook signatures (Midtrans `signature_key`)** | Critical | HMAC SHA512 key for payment verification |
| **Database credentials & API keys** | Critical | Infrastructure-level compromise |

---

## 2. Authentication

### Customer Authentication

- **Guest checkout**: Customers can place orders by providing phone number only. No account required.
- **Optional account creation**: Phone-number-based auth via Supabase Auth. OTP verification required.
- **Session management**: Supabase-issued JWTs stored in secure, HttpOnly, SameSite cookies. No tokens in localStorage.
- **No password-based login for customers**: OTP-only flow eliminates password-related attack surface.

### Admin Authentication

- **Mandatory Supabase Auth**: Email + password as primary factor.
- **2FA / OTP**: Required for all admin accounts. Enforced at account level; cannot be skipped.
- **Session timeout**: Admin sessions expire after inactivity. Re-authentication required for sensitive operations (price changes, role assignments, bulk order modifications).
- **No shared admin accounts**: Each admin must have individual credentials. Shared credentials void audit trail integrity.

### Service-Level Authentication

- Webhook endpoints authenticate via Midtrans HMAC SHA512 signature verification. No other trust model.
- Internal API calls between server components use service tokens, never user-derived tokens.

---

## 3. Authorization & RBAC

### Role Hierarchy

| Role | Default Access | Purpose |
|---|---|---|
| `SUPER_ADMIN` | Full platform access | Platform owner; only role with role-management and config changes |
| `ADMIN` | Broad operational access | Day-to-day management; does NOT include SUPER_ADMIN privileges by default |
| `OPERATIONS` | Order management, inventory, fulfillment | Operations team workflow |
| `FINANCE` | Payment records, invoices, financial reports | Finance team; no order modification rights |
| `CONTENT_MANAGER` | Product catalog, descriptions, media | CMS-only; no pricing or order access |
| `CUSTOMER_SERVICE` | Customer support tickets, order status lookup | Limited PII access; no bulk data export |

### RBAC Rules

- **Deny-by-default**: Every permission must be explicitly granted to a role. No implicit "all access."
- **Permission-coded guards**: Authorization checks use permission codes (e.g., `orders.read`, `prices.write`, `customers.export`), not role-name string comparisons.
- **Least privilege enforcement**: Roles are granted only the minimum permissions required for their function. `CUSTOMER_SERVICE` cannot access full customer data beyond what the support ticket requires.
- **No role escalation via UI**: Role assignment is restricted to `SUPER_ADMIN`. Admin UI does not expose role-change controls to lower-privilege roles.
- **Audit logging on all role changes**: Every permission grant/revoke is logged with actor, timestamp, and affected role.

---

## 4. Input Validation

- **Zod schemas everywhere**: All incoming data (API routes, form submissions, webhook payloads) validated against Zod schemas before processing.
- **Server-side only**: Validation runs exclusively on the server. Client-side validation is UX-only and never trusted.
- **Type narrowing**: Zod output types narrow runtime data to expected shapes. Invalid data is rejected with structured error responses; raw error details are not leaked to clients.
- **Webhook payloads**: Midtrans webhook JSON is schema-validated before signature verification. Malformed payloads are rejected immediately.

---

## 5. Server-Side Price Validation

- **Quote engine authority**: All prices used in order creation are fetched from the server-side quote engine. Frontend-submitted prices are ignored.
- **Tamper detection**: If a frontend price differs from the server quote, the order is rejected and the discrepancy is logged for audit.
- **Pricing rules confidentiality**: Internal pricing logic, discount rules, and margin calculations are never exposed to client-side code. No pricing logic in `NEXT_PUBLIC_*` variables.
- **Audit trail**: Every price quote and price validation result is logged with order ID, user ID, and timestamp.

---

## 6. Rate Limiting

- **Redis-backed**: Rate limiting state stored in Redis for distributed enforcement across server instances.
- **Strict thresholds**:

| Endpoint Category | Limit | Window |
|---|---|---|
| Login / OTP request | 5 requests | 15 minutes per IP/account |
| Order creation | 10 requests | 1 hour per authenticated user |
| Payment initiation | 5 requests | 15 minutes per order |
| Webhook ingestion | 100 requests | 1 minute per source IP |
| Password reset | 3 requests | 1 hour per account |

- **Graceful degradation**: Rate-limited requests receive HTTP 429 with `Retry-After` header. No sensitive error information is returned.
- **Bot protection**: Cumulative rate limiting across endpoints detects automated patterns and escalates blocking.

---

## 7. CSRF Protection

- **SameSite cookies**: All session cookies set with `SameSite=Lax` (or `Strict` where feasible). Prevents cross-site request forgery on state-changing endpoints.
- **State checks**: Sensitive operations (order placement, payment initiation, profile changes) validate referer/origin headers as secondary defense.
- **No CSRF tokens for API routes**: Supabase Auth JWT in HttpOnly cookies provides sufficient protection when combined with SameSite. CSRF tokens are used for server-rendered form submissions.

---

## 8. Secure Cookies & Sessions

- **HttpOnly**: All auth tokens stored in HttpOnly cookies. No JavaScript access.
- **Secure**: All cookies set with `Secure` flag in production. No exceptions.
- **SameSite**: `Lax` by default; `Strict` for admin sessions.
- **Path restriction**: Cookies scoped to minimum necessary path.
- **No sensitive data in cookies**: Session identifiers only. No PII, no payment data, no role information in cookie value.
- **Cookie expiration**: Short-lived access tokens (minutes) with refresh token rotation for session extension.

---

## 9. Secrets Management

### Environment Variable Matrix

| Variable | Location | Client-Visible | Notes |
|---|---|---|---|
| `SUPABASE_URL` | Server + Client | Yes (`NEXT_PUBLIC_`) | Public project URL, safe for client |
| `SUPABASE_ANON_KEY` | Server + Client | Yes (`NEXT_PUBLIC_`) | Supabase anon key, safe for client |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | **NEVER** | Bypasses RLS; server-side only |
| `DATABASE_URL` | Server only | **NEVER** | Direct database connection |
| `MIDTRANS_SERVER_KEY` | Server only | **NEVER** | Payment processing |
| `MIDTRANS_CLIENT_KEY` | Server only | **NEVER** | Client-facing Midtrans key; still server-only |
| `MIDTRANS_WEBHOOK_SIGNATURE_KEY` | Server only | **NEVER** | HMAC SHA512 webhook verification |
| `REDIS_URL` | Server only | **NEVER** | Rate limiting and caching |
| `NEXT_PUBLIC_*` | Server + Client | Yes | Only explicitly whitelisted variables |

### Rules

- **NEVER expose**: Payment secrets, database credentials, API keys, Midtrans server key, internal pricing rules, or Supabase service role key to the client.
- **`NEXT_PUBLIC_*` whitelist**: Only variables explicitly prefixed with `NEXT_PUBLIC_` and reviewed for safety are exposed to the client. Default is deny.
- **Secrets rotation**: All secrets must be rotatable without code deployment. Infrastructure-level secret management.
- **No secrets in source code**: All secrets sourced from environment variables. No hardcoded credentials in source files or configuration.

---

## 10. Webhook Security

### Midtrans Webhook Verification

- **HMAC SHA512 signature**: Every incoming webhook is verified against `MIDTRANS_WEBHOOK_SIGNATURE_KEY` using the `signature_key` field in the payload.
- **Signature verification order**: Schema validation → Signature check → Business logic processing. Never process business logic before verification.
- **Replay protection**: Webhook notifications are timestamped. Notifications older than 24 hours are rejected. Notifications with future timestamps are rejected.

### Idempotency

- **Order creation**: Duplicate order submissions are detected via idempotency key. Same key → same order, no duplication.
- **Payment creation**: Duplicate payment initiation for same order is rejected.
- **Webhook handling**: Same `order_id` + `status_code` + `signature_key` combination is processed only once. Subsequent notifications for same state transition are acknowledged (HTTP 200) but not re-processed.
- **Inventory deduction**: Deduction is atomic and idempotent. Duplicate deduction requests do not reduce stock twice.
- **WhatsApp order generation**: Same order does not generate duplicate WhatsApp messages.

---

## 11. Data Protection

### At Rest

- Supabase PostgreSQL with encrypted storage (AES-256 at rest by default).
- Sensitive fields (payment records, PII) stored in dedicated tables with strict RLS policies.
- No sensitive data in log files or analytics pipelines.

### In Transit

- All connections over TLS 1.2+ (HTTPS enforced).
- Supabase connections use SSL. Database direct connections use `sslmode=require`.
- WhatsApp deep links use `wa.me` protocol (HTTPS).

---

## 12. Logging Hygiene

- **Structured logging**: JSON-formatted logs with correlation IDs for request tracing.
- **No sensitive data in logs**: Never log passwords, tokens, full card numbers, API keys, or Midtrans server key.
- **PII masking**: Customer phone numbers and addresses are masked in logs (e.g., `+62***1234`).
- **Admin action logging**: Every admin action (role change, order modification, price override) logged with actor ID, action type, and affected entity.
- **Audit log immutability**: Audit logs are append-only. No delete or update operations permitted on audit tables.
- **Log retention**: Logs retained per compliance schedule, then purged automatically.

---

## 13. Supabase Security Checklist

| # | Rule | Status |
|---|---|---|
| 1 | **Enable RLS on ALL exposed tables.** No table is exempt. | Required |
| 2 | **Never use `user-editable raw_user_meta_data` for authorization.** Use `app_metadata` for roles and permissions. | Required |
| 3 | **`TO authenticated` alone is authentication, not authorization.** Every SELECT/UPDATE/DELETE policy must include ownership predicates (e.g., `auth.uid() = user_id`). | Required |
| 4 | **UPDATE policies need both `USING` and `WITH CHECK`.** `USING` controls which rows can be updated; `WITH CHECK` controls what values are written. | Required |
| 5 | **Views bypass RLS unless `security_invoker` is set.** All views that expose table data must use `security_invoker` to inherit the calling user's RLS context. | Required |
| 6 | **Avoid `SECURITY DEFINER` in public schema.** Functions with `SECURITY DEFINER` run as the owner and bypass RLS. Use `SECURITY INVOKER` unless explicitly justified. | Required |
| 7 | **Storage upsert needs `INSERT` + `SELECT` + `UPDATE` permissions.** Storage policies must allow all three operations for upsert to work. | Required |
| 8 | **Pin Supabase package versions.** Use exact version pinning in `package.json` for `@supabase/supabase-js` and `@supabase/ssr`. No caret ranges. | Required |

---

## 14. Injection & Vulnerability Mitigations

### SQL Injection

- Supabase client uses parameterized queries by default. Raw SQL queries are prohibited unless absolutely necessary and always use parameterized inputs.
- RLS policies enforce row-level access at the database level, reducing blast radius even if application-level checks fail.

### Cross-Site Scripting (XSS)

- React escapes output by default. Never use `dangerouslySetInnerHTML` without DOMPurify sanitization.
- Content Security Policy (CSP) headers set to restrict script sources.
- All user-supplied content rendered in HTML is sanitized before display.

### CSRF

- Covered in Section 7. SameSite cookies + origin checks.

### XML External Entity (XXE)

- No XML processing in the application. Midtrans webhooks use JSON. If XML is ever introduced, use a safe parser with external entity loading disabled.

---

## 15. Backup & Incident Response

### Backups

- Supabase automatic daily backups with point-in-time recovery.
- Backup retention per compliance requirements (minimum 90 days).
- Backups encrypted at rest. Access restricted to `SUPER_ADMIN` and infrastructure team.

### Incident Response Summary

1. **Detection**: Monitoring alerts on anomalous patterns (failed auth spikes, rate limit violations, webhook anomalies).
2. **Containment**: Immediately revoke compromised credentials. Disable affected admin accounts. Block offending IPs at infrastructure level.
3. **Eradication**: Rotate all secrets if infrastructure-level compromise is suspected. Review RLS policies and access logs.
4. **Recovery**: Restore from clean backup if data integrity is in question. Verify webhook signature keys are still valid.
5. **Post-incident**: Audit log review. Update threat model. Notify affected customers if PII breach occurred (per UU PDP requirements).

---

## 16. Security Testing Checklist

| # | Test | Frequency |
|---|---|---|
| 1 | RLS policy verification (all tables) | Every schema change |
| 2 | RBAC permission matrix validation | Every role/permission change |
| 3 | Price tampering test (submit altered frontend prices) | Every release |
| 4 | Webhook signature bypass test | Every release |
| 5 | Rate limiting effectiveness test | Quarterly |
| 6 | CSRF protection validation | Every release |
| 7 | XSS injection test on all user inputs | Every release |
| 8 | SQL injection test on all input points | Every release |
| 9 | Authentication bypass test (access protected routes without credentials) | Every release |
| 10 | Privilege escalation test (lower-privilege role accessing higher-privilege resources) | Every release |
| 11 | Idempotency test (duplicate webhook/order submission) | Every release |
| 12 | Secrets exposure audit (check `NEXT_PUBLIC_*` variables, client bundles, API responses) | Every release |
| 13 | Cookie security audit (HttpOnly, Secure, SameSite flags) | Quarterly |
| 14 | Third-party dependency vulnerability scan | Weekly |
| 15 | Admin session timeout validation | Quarterly |
