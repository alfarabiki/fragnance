# ATLASE Inventory Documentation

Inventory tracks physical stock across three item types: bottles, packaging, and fragrances. Every stock movement is audited.

---

## 1. Stock Model

Every inventory item maintains three stock counts:

| Metric           | Description                                      |
|------------------|--------------------------------------------------|
| Current Stock    | Physical quantity on hand                         |
| Reserved Stock   | Quantity allocated to unfulfilled orders          |
| Available Stock  | Current Stock minus Reserved Stock                |

**Formula:**

```
available_stock = current_stock - reserved_stock
```

- **Current Stock** increases on PURCHASE and RETURN; decreases on SALE.
- **Reserved Stock** increases on RESERVATION; decreases on CANCELLATION and SALE.
- **Available Stock** is always derived, never stored independently.

An item with 100 current, 25 reserved, and 75 available means 25 units are spoken for by pending orders but have not yet shipped.

---

## 2. Inventory Item Types

### Bottles

| Attribute      | Description                                |
|----------------|--------------------------------------------|
| Item Type      | BOTTLE                                     |
| Linked To      | Bottle product record                      |
| Tracked Fields | current_stock, reserved_stock, status      |
| Unit           | piece (individual bottle)                  |

### Packaging

| Attribute      | Description                                |
|----------------|--------------------------------------------|
| Item Type      | PACKAGING                                  |
| Linked To      | Packaging product record (Standard/Premium/Gift/Custom) |
| Tracked Fields | current_stock, reserved_stock, status      |
| Unit           | piece (individual packaging unit)          |

### Fragrances

| Attribute      | Description                                |
|----------------|--------------------------------------------|
| Item Type      | FRAGRANCE                                  |
| Linked To      | Fragrance product record                   |
| Tracked Fields | current_stock, reserved_stock, status      |
| Unit           | ml (milliliters)                           |

Fragrance stock is measured in milliliters because volumes are precise and fractional reservations may occur.

---

## 3. Reservation Flow

### At Order Creation

When an order is confirmed:

1. System checks available_stock for each line item (bottle, packaging, fragrance volume).
2. If available_stock >= requested quantity for all items → stock is reserved.
3. Reserved Stock increments for each item.
4. Available Stock decreases by the reserved amount.
5. A RESERVATION movement is recorded in the ledger for each item.

If any item has insufficient available_stock, the order is rejected and the admin is notified.

### Release on Cancellation

When an order is cancelled (by customer, admin, or timeout):

1. Reserved Stock decrements for each previously reserved item.
2. Available Stock increases back.
3. A CANCELLATION movement is recorded in the ledger.

### Release on Expiry

Orders that remain unconfirmed or unpaid past a configurable timeout window are automatically cancelled. The reservation release follows the same flow as manual cancellation.

### Deduction on SALE

When an order ships and payment is confirmed:

1. Current Stock decrements for each item.
2. Reserved Stock decrements for each item (the reservation is fulfilled).
3. A SALE movement is recorded in the ledger.

This two-step (reserve → sale) ensures stock is never double-booked.

---

## 4. Movement Ledger

Every stock change creates an immutable ledger entry.

| Movement Type | When It Fires                                         | Current Stock | Reserved Stock | Available Stock |
|---------------|-------------------------------------------------------|:-------------:|:--------------:|:---------------:|
| PURCHASE      | New stock received from supplier                      | +             | —              | +               |
| RESERVATION   | Order confirmed, stock allocated                      | —             | +              | —               |
| SALE          | Order shipped, payment confirmed                      | —             | —              | —               |
| CANCELLATION  | Order cancelled before shipment                       | —             | -              | +               |
| ADJUSTMENT    | Admin manual correction (audit required)              | + or -        | —              | + or -          |
| RETURN        | Customer return processed, stock reclaimed            | +             | —              | +               |

### Ledger Entry Fields

| Field         | Description                                    |
|---------------|------------------------------------------------|
| Item Type     | BOTTLE / PACKAGING / FRAGRANCE                 |
| Item ID       | ID of the inventory item                       |
| Movement Type | One of the six types above                     |
| Quantity      | Amount changed (always positive; sign implied by type) |
| Related Order | Order ID (if applicable)                       |
| Admin         | Who initiated (if manual)                      |
| Timestamp     | When the movement occurred                     |
| Reason        | Explanation (required for ADJUSTMENT)          |

Ledger entries are append-only. No entry is ever deleted or modified.

---

## 5. Low-Stock Alerts

### Threshold Configuration

Admin configures per-item low-stock thresholds:

| Field              | Description                              |
|--------------------|------------------------------------------|
| Low Stock Alert    | Trigger warning when available_stock ≤ N |
| Out of Stock Alert | Trigger when available_stock = 0         |

### Alert Behavior

- Dashboard widget highlights items below threshold.
- Email/WhatsApp notification to OPERATIONS role when triggered.
- Items below threshold are flagged in the product catalog.
- Items at zero stock are automatically marked as OUT_OF_STOCK on the storefront.

---

## 6. Admin Adjustment

Admins with INVENTORY or OPERATIONS role can manually adjust stock.

### Adjustment Flow

1. Admin selects item, enters new quantity or delta.
2. Admin provides a mandatory reason for the adjustment.
3. System validates the input (no negative stock, no negative reserved).
4. ADJUSTMENT movement is created in the ledger.
5. Stock counts are updated.
6. Audit log entry is created with old/new values.

### Guardrails

- Reserved Stock cannot be adjusted independently — it is only modified by order events.
- Adjustments that would make Reserved Stock negative are rejected.
- All adjustments require a reason; blank reason is rejected.

---

## 7. Reconciliation

Periodic reconciliation ensures physical stock matches system records.

### Process

1. Admin performs physical count of bottles, packaging, and fragrance stock.
2. Admin enters counted quantities into the reconciliation form.
3. System compares counted vs. system (current_stock).
4. Discrepancies are displayed.
5. Admin confirms adjustment for each discrepant item with a reason.
6. ADJUSTMENT movements are created for each discrepancy.
7. A reconciliation report is generated.

### Reconciliation Report

| Field            | Description                              |
|------------------|------------------------------------------|
| Date             | When reconciliation was performed        |
| Admin            | Who performed the reconciliation         |
| Items Checked    | Total items reconciled                   |
| Discrepancies    | Number of items with mismatch            |
| Adjustments Made | Number of ADJUSTMENT movements created   |
| Details          | Per-item breakdown (expected, actual, delta) |

### Schedule

Reconciliation should be performed:

- Monthly for high-volume items.
- Quarterly for low-volume items.
- Immediately after any suspected loss, damage, or theft.
