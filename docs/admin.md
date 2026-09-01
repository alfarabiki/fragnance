# ATLASE Admin Documentation

Admin is a standalone Next.js application (`apps/admin`). Merchants configure and manage all commerce operations without developer intervention.

---

## 1. Admin Information Architecture

### Navigation Structure

```
Dashboard
Orders
  ├─ Orders List
  ├─ Order Detail
  └─ WhatsApp Orders
Products
  ├─ Fragrances
  ├─ Bottles
  └─ Packaging
Pricing
  ├─ Pricing Rules
  ├─ Price Simulator
  └─ Pricing Versions
Inventory
Customers
  └─ Customer Detail
Payments
Promotions
Analytics
Audit Logs
Settings
```

---

## 2. Roles & Permissions Matrix

Roles: **SUPER_ADMIN**, **ADMIN**, **OPERATIONS**, **FINANCE**, **CONTENT_MANAGER**, **CUSTOMER_SERVICE**.

| Module               | SUPER_ADMIN | ADMIN | OPERATIONS | FINANCE | CONTENT_MANAGER | CUSTOMER_SERVICE |
|----------------------|:-----------:|:-----:|:----------:|:-------:|:---------------:|:----------------:|
| Dashboard            | ✅          | ✅    | ✅         | ✅      | ❌              | ❌               |
| Orders               | ✅          | ✅    | ✅         | ✅      | ❌              | ✅               |
| Products             | ✅          | ✅    | ❌         | ❌      | ✅              | ❌               |
| Products (Images)    | ✅          | ✅    | ❌         | ❌      | ✅              | ❌               |
| Fragrances           | ✅          | ✅    | ❌         | ❌      | ✅              | ❌               |
| Bottles              | ✅          | ✅    | ❌         | ❌      | ❌              | ❌               |
| Packaging            | ✅          | ✅    | ❌         | ❌      | ❌              | ❌               |
| Pricing              | ✅          | ✅    | ❌         | ✅      | ❌              | ❌               |
| Pricing Rules        | ✅          | ✅    | ❌         | ✅      | ❌              | ❌               |
| Inventory            | ✅          | ✅    | ✅         | ❌      | ❌              | ❌               |
| Customers            | ✅          | ✅    | ❌         | ❌      | ❌              | ✅               |
| Payments             | ✅          | ✅    | ❌         | ✅      | ❌              | ❌               |
| WhatsApp Orders      | ✅          | ✅    | ✅         | ❌      | ❌              | ✅               |
| Promotions           | ✅          | ✅    | ❌         | ❌      | ✅              | ❌               |
| Analytics            | ✅          | ✅    | ❌         | ✅      | ✅              | ❌               |
| Audit Logs           | ✅          | ✅    | ❌         | ❌      | ❌              | ❌               |
| Settings             | ✅          | ✅    | ❌         | ❌      | ❌              | ❌               |

**Default-deny:** An unlisted cell means the role has zero access to that module. SUPER_ADMIN is the only role with full access by default. All other roles are scoped to their mapped modules.

---

## 3. Fragrance Management

Admin creates, edits, and deactivates fragrances. No developer involvement.

### Fields

| Field          | Type        | Notes                                      |
|----------------|-------------|--------------------------------------------|
| Name           | text        | Display name                               |
| Price per ml   | number (Rp) | Base pricing unit                          |
| Cost per ml    | number (Rp) | Used in profit calculations                |
| Minimum amount | number (ml) | Smallest allowed volume for this fragrance |
| Maximum amount | number (ml) | Largest allowed volume for this fragrance  |
| Image          | file upload | Hero image for storefront                  |
| Description    | rich text   | Customer-facing description                |
| Notes          | internal    | Admin-only notes, not shown to customers   |
| Category       | enum        | Fragrance family classification            |
| Popularity     | number      | Ranking signal for sort order              |
| Visibility     | toggle      | Published / Hidden                         |

### Lifecycle

- **Created** → Hidden by default.
- Admin fills fields → Preview → Publish.
- Deactivating hides from storefront but preserves order history references.

---

## 4. Bottle Management

### Fields

| Field     | Type        | Notes                          |
|-----------|-------------|--------------------------------|
| Name      | text        | e.g. "50ml Amber Bottle"       |
| Volume    | number (ml) | Capacity of the bottle         |
| Cost      | number (Rp) | Procurement cost               |
| Sell Price| number (Rp) | Retail price if sold standalone|
| Image     | file upload | Display image                  |
| Stock     | number      | Current physical count         |
| Status    | enum        | ACTIVE / INACTIVE              |

### Lifecycle

- Created → ACTIVE.
- Deactivating removes from storefront; existing orders retain reference.

---

## 5. Packaging Management

### Packaging Tiers

| Tier        | Description                                      |
|-------------|--------------------------------------------------|
| Standard    | Default packaging, minimal cost                  |
| Premium     | Upgraded materials, higher perceived value       |
| Gift        | Gift-ready presentation with extras              |
| Custom      | Fully bespoke packaging configuration            |

### Fields

| Field      | Type        | Notes                              |
|------------|-------------|------------------------------------|
| Name       | text        | e.g. "Premium Velvet Box"          |
| Tier       | enum        | STANDARD / PREMIUM / GIFT / CUSTOM |
| Cost       | number (Rp) | Procurement cost                   |
| Sell Price | number (Rp) | Price charged to customer          |
| Image      | file upload | Display image                      |
| Mandatory  | toggle      | If true, must be selected          |
| Optional   | toggle      | If true, customer may add or skip  |
| Stock      | number      | Current physical count             |
| Status     | enum        | ACTIVE / INACTIVE                  |

---

## 6. Pricing Management

Pricing is configured by admin through the Pricing module. No code is involved.

### Price Components

- **Price per ml** — set on each fragrance, defines base material cost to customer.
- **Cost per ml** — set on each fragrance, internal procurement cost.
- **Bottle price** — from bottle sell price.
- **Packaging price** — from packaging sell price.
- **Pricing rules** — additional conditional modifiers (see section 7).

### Price Versions

Every pricing configuration is versioned.

| Version | Status   | Notes                                      |
|---------|----------|--------------------------------------------|
| v1.0    | ACTIVE   | Currently live on storefront               |
| v1.1    | DRAFT    | In-progress changes, not visible publicly  |

- Only one version can be ACTIVE at a time.
- A new version is promoted to ACTIVE via the publish workflow.

### Publish Workflow

```
DRAFT → PREVIEW → VALIDATE → PUBLISH
```

1. **DRAFT** — Admin edits pricing fields. Changes are saved but not visible.
2. **PREVIEW** — Admin reviews a read-only summary of all changes.
3. **VALIDATE** — System checks for rule consistency, required fields, price integrity.
4. **PUBLISH** — Active version is archived; new version becomes ACTIVE.

---

## 7. Pricing Rules Editor

Pricing rules are **structured data** — condition/effect records stored in the database. They are NOT executable code.

### Structure

Each rule has:

- **Conditions** — what must be true for the rule to fire.
- **Effects** — what the rule modifies.

### Example Rules

```
Rule 1:
  IF volume = 50ml
  THEN concentration range = 5-40ml

Rule 2:
  IF bottle = Premium
  THEN price adjustment = +Rp4,000

Rule 3:
  IF fragrance_amount >= 30ml
  THEN apply discount rule X
```

### Editor UI

- Admin adds rules from a structured form (dropdown for operators, input for values).
- Rules are ordered by priority; top rule wins on conflict.
- Each rule has a name, description, priority, enabled toggle, and version linkage.
- Rules are previewed in the Price Simulator before activation.

---

## 8. Price Simulator

The simulator lets admin preview final pricing before publishing.

### Example

| Component          | Value        |
|--------------------|--------------|
| Fragrance          | Dior-inspired|
| Volume             | 50ml         |
| Aroma              | 20ml         |
| Bottle             | Premium      |
| Packaging          | Standard     |
| **Total Cost**     | Rp53,000     |
| **Selling Price**  | Rp89,000     |
| **Gross Profit**   | Rp36,000     |
| **Gross Margin**   | 40.4%        |

The simulator applies all active pricing rules and shows the exact breakdown. Admin can adjust inputs and re-simulate instantly.

---

## 9. Orders List & Detail

### Orders List View

Columns: Order #, Customer, Date, Total, Status, Payment, WhatsApp.

- Filterable by status, date range, payment channel.
- Sortable by any column.
- Bulk actions: mark shipped, export, bulk WhatsApp notification.

### Order Detail Layout

The detail screen is organized into sections:

**Header**
- Order # (unique identifier)
- Order date and time

**Customer Info**
- Customer name
- Phone number
- Delivery address

**Product Configuration**
- Fragrance name
- Volume (ml)
- Aroma concentration (ml)
- Bottle selection
- Packaging selection

**Pricing Breakdown**
- Base fragrance cost
- Bottle cost
- Packaging cost
- Pricing rule adjustments
- Subtotal
- Tax (if applicable)
- Grand total

**Payment**
- Payment channel (bank transfer, e-wallet, COD, etc.)
- Payment status (PENDING, CONFIRMED, FAILED, REFUNDED)
- Payment reference

**WhatsApp Status**
- Message sent / delivered / read
- Conversation link

**Order Timeline**

A chronological event log:

```
18:20  Order created
18:21  WhatsApp conversation opened
18:35  Order confirmed
18:40  Payment received
19:00  Processing started
Next day  Shipped
```

---

## 10. Order Status Transitions

```
CREATED
  → CONFIRMED     (manual or auto via WhatsApp)
  → CANCELLED     (by customer or admin)

CONFIRMED
  → PAID          (payment confirmed)
  → CANCELLED     (timeout or manual)

PAID
  → PROCESSING    (production started)
  → REFUNDED      (refund issued)

PROCESSING
  → SHIPPED       (handed to courier)
  → CANCELLED     (rare, pre-ship)

SHIPPED
  → DELIVERED     (courier confirmation)
  → RETURNED      (delivery failed or customer return)
```

Every transition is logged in the audit trail with timestamp and reason.

---

## 11. Customers

### Customer List View

Columns: Name, Phone, Email, Last Order, Total Spend, Orders Count.

- Searchable by name, phone, email.
- Filterable by last order date, total spend range.

### Customer Detail

- **Profile** — name, phone, email, registration date.
- **Addresses** — list of saved addresses with labels.
- **Orders** — all orders linked to this customer, with status and total.
- **Total Spend** — cumulative lifetime value.
- **Average Order Value** — derived from order history.
- **Last Order** — most recent order summary.
- **Communication Channel** — primary WhatsApp contact.
- **Consent Records** — marketing, data processing, WhatsApp opt-in status.

### Access Control

Sensitive customer data (payment details, full address history) is only visible to roles with customer module access. Customer Service and SUPER_ADMIN have full access. Other roles see only order-linked summary data.

---

## 12. WhatsApp Orders

The WhatsApp Orders module manages conversations that originate from WhatsApp.

### Views

- **Incoming** — new messages from customers placing orders.
- **Active** — conversations with orders in progress.
- **Resolved** — completed or closed conversations.

### Actions

- Link a WhatsApp conversation to an order.
- Create an order directly from a WhatsApp message.
- Send order status updates via WhatsApp.
- View full message history per customer.

---

## 13. Payments

### Payment List View

Columns: Order #, Customer, Amount, Channel, Status, Date.

- Filterable by channel, status, date range.
- Exportable for reconciliation.

### Payment Channels

| Channel        | Notes                               |
|----------------|-------------------------------------|
| Bank Transfer  | Manual confirmation required        |
| E-Wallet       | Instant or near-instant confirmation|
| COD            | Cash on delivery                    |
| Virtual Account| Auto-matched to order               |

### Payment Statuses

| Status    | Meaning                              |
|-----------|--------------------------------------|
| PENDING   | Awaiting payment                     |
| CONFIRMED | Payment received and verified        |
| FAILED    | Payment attempt failed               |
| REFUNDED  | Refund issued to customer            |

---

## 14. Analytics

### Dashboard Widgets

- Revenue (daily / weekly / monthly)
- Orders count by status
- Average order value
- Top fragrances by volume
- Top bottles / packaging by attach rate
- Payment channel distribution
- Customer acquisition trend

### Reports

- Sales by fragrance
- Margin analysis per configuration
- Inventory turnover
- Customer lifetime value segments

---

## 15. Audit Logs

Every significant admin action is recorded.

### Log Entry Fields

| Field     | Description                                       |
|-----------|---------------------------------------------------|
| Admin     | Who performed the action                          |
| Action    | CREATE / UPDATE / DELETE / PUBLISH / ADJUST       |
| Entity    | FRAGRANCE / BOTTLE / PACKAGING / ORDER / PRICING  |
| Entity ID | Unique identifier of the affected record          |
| Old Value | Previous state (JSON snapshot)                    |
| New Value | Updated state (JSON snapshot)                     |
| Timestamp | When the action occurred (ISO 8601)               |
| Reason    | Free-text explanation for the change              |

### Access

Only ADMIN and SUPER_ADMIN roles can view audit logs.

---

## 16. Settings

Global configuration accessible only to ADMIN and SUPER_ADMIN:

- Store name and branding
- Default currency (IDR)
- Tax settings
- Shipping integrations
- WhatsApp Business API configuration
- Payment gateway credentials
- Notification templates
- Data retention policies
- Role management (assign/remove roles)
- User accounts (admin team)
