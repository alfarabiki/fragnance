# ATLASE Privacy Documentation

## 1. Legal Basis & Data Minimization

### UU PDP Alignment (Undang-Undang Perlindungan Data Pribadi)

ATLASE processes personal data in compliance with Indonesia's UU PDP. All data processing activities are grounded in one or more lawful bases:

- **Consent**: Explicit, informed, and specific consent obtained before processing personal data for marketing or non-essential purposes.
- **Contractual necessity**: Processing required to fulfill an order, process a payment, or deliver a service the customer has requested.
- **Legal obligation**: Processing required for tax compliance, financial record-keeping, or regulatory reporting under Indonesian law.
- **Legitimate interest**: Processing necessary for fraud prevention, security monitoring, or platform integrity — subject to balancing tests and documented justification.

### Data Minimization Principle

- Collect **only** the data strictly necessary for the specific feature or purpose.
- No "just in case" data collection. Every field collected must map to a documented purpose.
- Review data collection points quarterly to remove fields that are no longer necessary.
- Customer-facing forms display only required fields. Optional fields must have clear justification.

---

## 2. What We Collect (By Feature)

### Account & Authentication

| Data | Purpose | Retention | Required |
|---|---|---|---|
| Phone number | OTP-based authentication, order communication | Account lifetime + retention period | Yes |
| Email (if provided) | Account recovery, optional notifications | Account lifetime + retention period | No |

### Order Placement & Fulfillment

| Data | Purpose | Retention | Required |
|---|---|---|---|
| Full name | Order delivery, invoice | 5 years (tax compliance) | Yes |
| Shipping address | Order delivery | 5 years | Yes |
| Phone number | Delivery coordination, order updates | 5 years | Yes |
| Order history | Service fulfillment, support | 5 years | Yes |

### Payment Processing

| Data | Purpose | Retention | Required |
|---|---|---|---|
| Payment method type | Transaction processing | 5 years (financial compliance) | Yes |
| Transaction ID (Midtrans) | Payment reconciliation, dispute resolution | 5 years | Yes |
| Payment status | Order state management | 5 years | Yes |
| Transaction amount (IDR, integer) | Financial records, tax | 5 years | Yes |

### Customer Service

| Data | Purpose | Retention | Required |
|---|---|---|---|
| Support ticket content | Issue resolution | 2 years after resolution | Yes (if contact initiated) |
| Order references in tickets | Context for support | 2 years after resolution | No |

### Analytics

| Data | Purpose | Retention | Required |
|---|---|---|---|
| Anonymized usage patterns | Product improvement | 1 year | No |
| Aggregated order statistics | Business reporting | Indefinite (no PII) | No |

### What We Do NOT Collect

- National ID numbers (NIK/KTP) — not required for ecommerce
- Financial account details (bank account numbers, card numbers) — handled by Midtrans
- Biometric data
- Location data beyond shipping address
- Browsing history for profiling without consent

---

## 3. Consent Model

### Consent Categories

| Category | Scope | Default | Withdrawal |
|---|---|---|---|
| `DATA_PROCESSING` | Order fulfillment, payment processing, account management | Granted at account creation / order placement (contractual necessity) | Cannot withdraw without account deletion (contractual basis) |
| `MARKETING` | Promotional emails, product recommendations, sale announcements | **Not granted** (explicit opt-in required) | One-click unsubscribe or contact support |
| `WHATSAPP` | WhatsApp order updates, promotional messages via wa.me | **Not granted** (explicit opt-in required) | Reply STOP or contact support |

### Consent Records

- Every consent grant or revocation is recorded with:
  - **User ID** (or session identifier for guests)
  - **Consent category** (`MARKETING`, `DATA_PROCESSING`, `WHATSAPP`)
  - **Action** (`GRANTED` or `REVOKED`)
  - **Source** (`account_creation`, `order_placement`, `settings_page`, `support_ticket`, `unsubscribe_link`)
  - **Timestamp** (UTC, stored as integer)
- Consent records are append-only. History is never deleted or modified.

### Consent Sources

- **Account creation**: `DATA_PROCESSING` granted implicitly (contractual). `MARKETING` and `WHATSAPP` presented as separate checkboxes, **unchecked by default**.
- **Order placement**: `DATA_PROCESSING` granted for order fulfillment scope. Marketing consent not requested during checkout.
- **Settings page**: Customer can grant or revoke `MARKETING` and `WHATSAPP` at any time.
- **Unsubscribe link**: Every marketing communication includes one-click revocation link.

---

## 4. Privacy Notice

### Web Privacy Notice

Published at a dedicated URL (e.g., `/privacy`). Covers:

- **Identity of controller**: ATLASE platform operator name and contact.
- **Types of data collected**: Per Section 2 above.
- **Purposes of processing**: Per feature, per data type.
- **Legal basis**: Per Section 1.
- **Third-party sharing**: Per Section 9.
- **Data retention**: Per Section 5.
- **Customer rights**: Access, correction, erasure, portability (per Section 7).
- **How to contact**: Email, WhatsApp, or in-app support channel.
- **Consent management**: How to view, grant, or revoke consents.

### WhatsApp Communication Notice

- First WhatsApp message includes a brief privacy notice: identifies ATLASE, states purpose (order update), and provides opt-out instructions.
- Marketing WhatsApp messages include opt-out instructions at the bottom.
- No WhatsApp messages sent to customers who have not granted `WHATSAPP` consent.

---

## 5. Data Retention Policy

### Retention Schedule

| Data Category | Retention Period | Justification | Deletion Method |
|---|---|---|---|
| **Orders & financial records** | 5 years from transaction date | Indonesian tax and financial compliance | Automated purge after retention period |
| **Payment transaction records** | 5 years from transaction date | Midtrans reconciliation, dispute resolution | Automated purge |
| **Audit logs** | 3 years | Security and compliance trail | Automated purge |
| **Analytics (anonymized)** | 1 year | Product improvement | Automated purge |
| **Customer account data** | Account lifetime + 3 years | Post-account deletion regulatory compliance | Automated purge after retention period |
| **Support tickets** | 2 years after resolution | Customer service quality | Automated purge |
| **Consent records** | Indefinite | Legal proof of consent/grant | Never deleted (append-only) |

### Retention Rules

- Customer data is not retained beyond the stated periods without explicit legal justification.
- When a customer requests erasure (Section 7), data not subject to legal retention is deleted within 30 days.
- Data subject to legal retention (financial records) is retained but access-restricted to `FINANCE` role only.
- Deletion cascades through all application tables. No orphaned PII.

---

## 6. Access Controls

### RBAC Data Access Matrix

| Role | Customer PII | Order Data | Financial Records | Audit Logs | Support Tickets |
|---|---|---|---|---|---|
| `SUPER_ADMIN` | Full access | Full access | Full access | Full access | Full access |
| `ADMIN` | Scoped access | Full access | Read-only | Read-only | Full access |
| `OPERATIONS` | Delivery-related only | Full access | None | None | Read-only |
| `FINANCE` | None (aggregated only) | Read-only | Full access | Read-only | None |
| `CONTENT_MANAGER` | None | None | None | None | None |
| `CUSTOMER_SERVICE` | Own-ticket scope only | Referenced orders only | None | None | Full access |

### Customer Service Limitations

- `CUSTOMER_SERVICE` role can access only the customer data relevant to the specific support ticket they are handling.
- No bulk data export capability.
- No access to financial records or audit logs.
- Ticket-scoped access: CS agent sees customer name, phone, and order details only for tickets assigned to them.

---

## 7. Right to Access & Erasure Workflow

### Access Request

1. Customer submits request via support channel (WhatsApp, email, or in-app form).
2. Identity verification: Customer must verify phone number (OTP) or provide order reference matching their session.
3. Request processed within **14 days** (per UU PDP guidance).
4. Response includes: all personal data held, processing purposes, third parties with access, retention periods.
5. Data provided in structured, readable format (JSON or PDF).

### Erasure Request

1. Customer submits erasure request via support channel.
2. Identity verification (same as access request).
3. Assessment: Identify data subject to legal retention obligations (financial records, tax compliance).
4. Non-retained data deleted within **30 days**.
5. Retained data access-restricted and purged when retention period expires.
6. Confirmation sent to customer via their preferred channel.
7. Consent records are **not** deleted (legal proof requirement).

### Exceptions to Erasure

- **Financial records**: Retained for 5 years per tax law, regardless of erasure request.
- **Active orders**: Erasure deferred until order is completed and retention period begins.
- **Fraud investigation**: Erasure deferred if data is subject to active investigation.

---

## 8. Cross-Feature Safeguards

### No Auto-Marketing Without Consent

- Customer data collected during order placement (name, phone, address) is **never** automatically used for marketing purposes.
- Marketing campaigns only target customers who have explicitly granted `MARKETING` consent.
- Segmentation for marketing excludes customers without `MARKETING` consent, even if they have account data.

### WhatsApp Re-Consent

- Customers who granted `WHATSAPP` consent must re-consent if ATLASE changes the nature of WhatsApp communications (e.g., adding promotional messages where only transactional messages were previously sent).
- Re-consent is requested via the settings page or a dedicated message before new communication types begin.

### Data Isolation Between Features

- Customer service ticket data is not fed into analytics pipelines.
- Order data used for analytics is anonymized (no names, no phone numbers, no addresses).
- Payment data is isolated to the `FINANCE` role; other roles see only order-level payment status.

---

## 9. Third Parties

| Third Party | Role | Data Shared | Purpose | Data Processing Agreement |
|---|---|---|---|---|
| **Midtrans** | Payment processor | Order ID, transaction amount, customer name, phone number (for payment) | Payment processing, fraud detection | Midtrans Data Processing Terms |
| **Supabase** | Database & authentication infrastructure | All application data (encrypted at rest) | Data storage, auth, real-time | Supabase DPA |
| **Analytics provider** (if applicable) | Usage analytics | Anonymized, aggregated data only | Product improvement | DPA required before integration |
| **WhatsApp (Meta)** | Messaging platform | Phone number (when WhatsApp messages sent) | Order updates, customer communication | Meta Business Terms |

### Third-Party Rules

- No customer PII is shared with third parties without a documented purpose and, where required, customer consent.
- All third-party integrations must have a Data Processing Agreement (DPA) in place.
- Third-party access is audited quarterly. Integrations no longer necessary are decommissioned and data deletion confirmed.
- Analytics data is anonymized before any third-party transmission. No raw PII in analytics pipelines.

---

## 10. Breach Response Summary

### Response Timeline

| Time | Action |
|---|---|
| **0–1 hour** | Detect and contain: Isolate affected systems, revoke compromised credentials, block unauthorized access |
| **1–24 hours** | Assess scope: Identify affected data subjects, data types, and volume. Determine if PII was accessed or exfiltrated |
| **24–72 hours** | Notify authorities: Report to relevant Indonesian authority per UU PDP breach notification requirements |
| **72 hours – 14 days** | Notify affected customers: Provide clear description of breach, data affected, steps taken, and what customers should do |
| **Ongoing** | Remediate: Fix root cause, rotate all potentially compromised secrets, update threat model, conduct post-incident review |

### Breach Classification

- **Low**: No PII accessed, no financial data involved. Internal incident report only.
- **Medium**: Limited PII exposure (e.g., names, phone numbers). Authority notification + affected customer notification.
- **High**: Financial data or payment records exposed. Full incident response + authority notification + customer notification + potential service suspension.
- **Critical**: Mass PII exfiltration or infrastructure compromise. Full incident response + emergency authority notification + all-customer notification + external forensics engagement.

### Customer Notification Content

- What happened and when.
- What data was affected.
- What ATLASE has done to contain and remediate.
- What customers should do (e.g., change password, monitor accounts).
- How to contact ATLASE for questions.
