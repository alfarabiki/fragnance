# ATLASE Customer Data Documentation

Customer data is centralized in a single unified model. This document defines the shape, boundaries, and lifecycle of that data.

---

## 1. Unified Customer Model

Each customer is a **singleton profile** — one record per person, regardless of how many orders they place or channels they use.

All customer data (profile, addresses, orders, payments, WhatsApp, consent) belongs to this single entity. There is no separate "account" vs. "customer" distinction. A customer record is created at first interaction (checkout, WhatsApp message, or registration) and accumulates data over time.

---

## 2. Profile Fields

| Field          | Type     | Required | Notes                                      |
|----------------|----------|----------|--------------------------------------------|
| ID             | UUID     | yes      | Internal primary key                       |
| Name           | text     | yes      | Full name                                  |
| Phone          | text     | yes      | Primary identifier (see section 8)         |
| Email          | text     | no       | Optional, used for email notifications     |
| Created At     | timestamp| yes      | Record creation time                       |
| Updated At     | timestamp| yes      | Last modification time                     |
| Auth ID        | UUID     | no       | Optional link to Supabase auth.users       |
| Notes          | text     | no       | Internal notes for customer service        |
| Tags           | array    | no       | Admin-assigned labels (VIP, wholesale, etc.)|

---

## 3. Addresses

A customer may have multiple addresses. Addresses are independent — deleting or modifying one does not affect others or the customer profile.

### Address Fields

| Field       | Type     | Required | Notes                              |
|-------------|----------|----------|------------------------------------|
| ID          | UUID     | yes      | Address primary key                |
| Label       | text     | no       | e.g. "Home", "Office"              |
| Recipient   | text     | yes      | Name on the delivery               |
| Phone       | text     | yes      | Delivery contact number            |
| Street      | text     | yes      | Street address line                |
| City        | text     | yes      | City / regency                     |
| Province    | text     | yes      | Province                           |
| Postal Code | text     | yes      | Postal code                        |
| Country     | text     | yes      | Defaults to ID (Indonesia)         |
| Is Default  | boolean  | yes      | One address is default per customer|
| Created At  | timestamp| yes      | When this address was added        |
| Updated At  | timestamp| yes      | When this address was last modified|

### Rules

- A customer can have zero or more addresses.
- Exactly one address is marked as default.
- Changing the default on a new address automatically un-defaults the previous one.
- Addresses referenced by in-progress orders cannot be deleted until the order is resolved.

---

## 4. Orders & Payment References

### Order Links

Each order references:

- The customer (customer_id).
- The address used for that order (snapshot at time of order, not a live reference).
- Payment records (one or more per order).

### Payment References

| Field          | Type     | Notes                              |
|----------------|----------|------------------------------------|
| ID             | UUID     | Payment record key                 |
| Order ID       | UUID     | Linked order                       |
| Channel        | enum     | BANK_TRANSFER, E_WALLET, COD, VA   |
| Status         | enum     | PENDING, CONFIRMED, FAILED, REFUNDED|
| Reference      | text     | External transaction ID            |
| Amount         | number   | Amount in IDR                      |
| Timestamp      | timestamp| When payment was recorded          |

Payment records are immutable once confirmed. Refunds create new records linked to the original.

---

## 5. Custom Fragrance Configs

When a customer creates a custom fragrance blend, the configuration is stored on their profile.

### Stored Config Fields

| Field         | Type     | Notes                              |
|---------------|----------|------------------------------------|
| Config ID     | UUID     | Configuration key                  |
| Fragrance ID  | UUID     | Selected base fragrance            |
| Volume        | number   | Selected volume in ml              |
| Aroma         | number   | Aroma concentration in ml          |
| Bottle ID     | UUID     | Selected bottle                    |
| Packaging ID  | UUID     | Selected packaging                 |
| Created At    | timestamp| When the config was created        |

Configs are retained even if the customer does not purchase them. They serve as a reference for reorders and as a basis for recommendation.

---

## 6. WhatsApp Channel & Order History

### WhatsApp Channel

Each customer has an optional WhatsApp channel record:

| Field          | Type     | Notes                              |
|----------------|----------|------------------------------------|
| Phone          | text     | WhatsApp-registered number         |
| Status         | enum     | ACTIVE, INACTIVE, BLOCKED          |
| Last Contact   | timestamp| Last message sent or received      |
| Consent        | boolean  | WhatsApp messaging consent         |

### Order History

All orders are queryable from the customer record. The history view shows:

- Order number
- Date
- Status
- Total amount
- Fragrance / bottle / packaging summary
- Payment status
- WhatsApp delivery status (if applicable)

Order history is append-only and never pruned.

---

## 7. Consent Records

Consent is tracked per-category with full audit trail.

### Consent Categories

| Category        | Description                                      |
|-----------------|--------------------------------------------------|
| MARKETING       | Promotional emails, SMS, WhatsApp campaigns       |
| DATA_PROCESSING | General data processing under UU PDP              |
| WHATSAPP        | WhatsApp message delivery and order updates       |

### Consent Record Fields

| Field     | Type     | Notes                                          |
|-----------|----------|-------------------------------------------------|
| Category  | enum     | MARKETING / DATA_PROCESSING / WHATSAPP           |
| Status    | enum     | GRANTED / REVOKED                               |
| Source    | text     | How consent was given or revoked (checkout, admin, self-service) |
| Timestamp | timestamp| When the consent change occurred                |
| IP / Ref  | text     | Optional, for audit trail                       |

### Rules

- Consent records are append-only. Revoking creates a new REVOKED record; it does not delete the GRANTED record.
- A customer with no consent records for a category is treated as not consenting (default-deny).
- Marketing messages require explicit MARKETING consent.
- WhatsApp messages require explicit WHATSAPP consent.
- Data processing consent is required for the platform to retain any customer data at all.

---

## 8. Customer Identifier Strategies

### Phone as Natural Key

Phone number serves as the natural key for checkout. Customers identify themselves by phone number during the checkout flow. The system:

1. Looks up the customer by phone.
2. If found → populates existing profile and addresses.
3. If not found → creates a new customer record from the checkout form.

This is frictionless — no account creation required. The phone number is the anchor.

### Optional Supabase Auth Link

For customers who create an account (register or log in):

- An `auth_id` field links the customer record to a Supabase `auth.users` entry.
- This enables email/password authentication, password reset, and session management.
- The auth link is optional — phone-based checkout works without it.
- A single customer record can have at most one `auth_id`.

### Identifier Priority

| Priority | Identifier    | Use Case                              |
|----------|---------------|---------------------------------------|
| 1        | Customer ID   | Internal lookups, API references      |
| 2        | Phone         | Checkout, WhatsApp, customer search   |
| 3        | Email         | Optional notifications, login         |
| 4        | Auth ID       | Supabase auth session only            |

---

## 9. Future Integrations Without Rebuild

The customer data model is designed with clean boundaries so the following integrations can be added without schema rewrites:

| Integration               | How It Connects                                |
|---------------------------|------------------------------------------------|
| CRM                       | Read customer profile, addresses, order history|
| Marketing Automation      | Read consent records, email, phone, segments    |
| WhatsApp Business API     | Read/write via WhatsApp channel record          |
| Warehouse / Fulfillment   | Read orders, write shipment status              |
| ERP                       | Read customer + order data, write accounting entries |
| Marketplace (Tokopedia, Shopee) | Map marketplace buyer to customer record, sync orders |
| Analytics (Mixpanel, GA4) | Read customer events and order data             |
| Loyalty Program           | Read total spend, order count, assign points    |

Each integration connects through the customer ID and reads/writes only within its own boundary. No integration modifies the core profile or consent model.

---

## 10. Data Retention & Deletion

ATLASE complies with **UU PDP** (Undang-Undang Pelindungan Data Pribadi — Indonesia's personal data protection law).

### Retention Policy

| Data Type            | Retention Period                               |
|----------------------|------------------------------------------------|
| Profile              | Retained while account is active                |
| Addresses            | Retained while account is active                |
| Orders               | Retained indefinitely (financial records)       |
| Payment References   | Retained indefinitely (financial records)       |
| Custom Configs       | Retained while account is active                |
| Consent Records      | Retained indefinitely (legal compliance)        |
| WhatsApp Messages    | Retained for 2 years, then archived             |
| Audit Logs           | Retained for 5 years                            |

### Deletion Process

When a customer requests data deletion (right to erasure under UU PDP):

1. Admin verifies the identity of the requestor.
2. Admin initiates deletion request in Settings.
3. System performs the following:
   - Profile fields are anonymized (name → "DELETED", phone → null, email → null).
   - Addresses are deleted.
   - Custom configs are deleted.
   - WhatsApp channel record is deactivated.
   - Consent records are marked REVOKED with source "DELETION_REQUEST".
4. Orders and payment records are retained (legal obligation) but decoupled from the customer identity.
5. The customer record is marked as DELETED with a timestamp.
6. A deletion audit entry is created.

### What Cannot Be Deleted

- Financial records (orders, payments) — required for tax and accounting compliance.
- Consent records — required to prove compliance with UU PDP.
- Audit logs — required for regulatory audit trails.

### Data Export

Customers can request a full data export. The system generates a structured file containing their profile, addresses, orders, configs, and consent history within 30 days of the request.
