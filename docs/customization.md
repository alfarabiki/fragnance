# Customization Flow — ATLASE

## 1. Step-by-step UX

| Step | Title | Description |
|------|-------|-------------|
| 1 | Pilih Aroma | Customer selects one or more fragrance oils from the catalog. Each fragrance has per-ml pricing, min/max ml bounds, and availability status. |
| 2 | Pilih Ukuran | Customer picks a total volume from admin-configured presets (30, 50, 70, or 100 ml). The selected volume constrains all downstream calculations. |
| 3 | Atur Kekuatan Aroma | Customer sets fragrance concentration — choose a preset (Lembut / Sedang / Kuat) or toggle "Atur sendiri" to use a free slider. |
| 4 | Pilih Botol | Customer picks a bottle. Bottle capacity must exactly match the chosen volume (capacity == volume). |
| 5 | Pilih Packaging | Customer picks packaging. Mandatory packaging may be enforced by admin config; if enabled, at least one packaging option must be selected. |
| 6 | Lihat Harga | A live price summary is displayed. The frontend shows an optimistic preview computed client-side. An authoritative quote is fetched from the server before proceeding. |
| 7 | Lanjut Pesan | Customer proceeds to checkout. The customization snapshot is persisted to the cart and, later, to the order. |

Steps 1–5 are freely navigable; the customer can go back and change any prior selection without losing subsequent choices. Step 6 updates live as any prior step changes. Step 7 is gated on a valid configuration and a successful authoritative quote.

## 2. Allowed Volumes (Presets)

- Volume presets are **admin-configurable** — they are loaded from the server, not hardcoded in the frontend.
- Default presets: **30 ml, 50 ml, 70 ml, 100 ml**.
- The frontend renders whatever presets the server returns. If the server list changes, the frontend adapts on next load without a code deploy.
- Selecting a volume constrains bottle selection (capacity must equal volume) and the formula calculation.

## 3. Min/Max Fragrance Amount per Fragrance

- Each fragrance defines its own **min_ml** and **max_ml** bounds.
- When multiple fragrances are selected, the sum of all fragrance ml values must satisfy each individual fragrance's bounds **and** the total must not exceed the selected volume.
- If a fragrance is marked unavailable, it cannot be selected and any previously selected configuration referencing it becomes invalid.

## 4. Alcohol Calculation (Derived)

Alcohol volume is derived, never directly chosen by the customer:

```
volume_ml = fragrance_ml + alcohol_ml
→ alcohol_ml = volume_ml − fragrance_ml
```

- `fragrance_ml` is the sum of ml allocated to all selected fragrances.
- `alcohol_ml` must be ≥ 0. If the customer pushes fragrance ml to the maximum allowed by the formula, alcohol fills the remainder.
- The alcohol price is charged per ml (admin-configured), applied to the derived `alcohol_ml`.

## 5. Bottle Compatibility

- A bottle is only available for selection if its **capacity equals the chosen volume**.
- Example: if the customer selects 50 ml, only bottles with capacity == 50 ml are shown.
- Bottles with mismatched capacity are hidden, not just disabled.
- Each bottle has a fixed unit price (admin-configured).

## 6. Packaging Compatibility + Mandatory Rules

- Packaging options are loaded from admin config.
- If **mandatory packaging** is enabled, the customer must select at least one packaging option before proceeding to step 6 (Lihat Harga).
- If mandatory packaging is disabled, packaging is optional.
- Multiple packaging options may be selected; each has its own unit price.
- Packaging is additive to the total price.

## 7. Slider Behavior

### Presets

Three preset buttons provide quick selection:

| Preset | Label | Interpretation |
|--------|-------|----------------|
| Low | Lembut | Lower fragrance concentration — subtler scent |
| Medium | Sedang | Balanced concentration |
| High | Kuat | Higher concentration — stronger scent |

Selecting a preset sets the slider to the corresponding value.

### Custom Slider ("Atur sendiri")

- Toggling "Atur sendiri" reveals a range slider.
- Slider **min** = the lowest min_ml across all selected fragrances.
- Slider **max** = the smaller of (a) the total volume minus 0 ml alcohol minimum, and (b) the sum of all selected fragrances' max_ml.
- **Step** = 1 ml.
- The slider value represents total fragrance_ml. Individual fragrance ml is distributed proportionally among selected fragrances.
- Example values for a 50 ml bottle: slider range might be 17–31 ml depending on the formula constraints.

### Validation Bounds

- The slider cannot be dragged outside min/max.
- If the customer reduces volume (step 2) such that the current slider value exceeds the new max, the slider snaps to the new max.
- If the customer adds a fragrance whose min_ml pushes the sum above the current slider value, the slider snaps up to the new minimum.

## 8. Live Price Updates

### Optimistic Preview

- The frontend computes a **preview price** locally as the customer changes any selection.
- Formula:

```
preview_price = Σ(fragrance_ml × fragrance_price_per_ml)
              + (alcohol_ml × alcohol_price_per_ml)
              + bottle_price
              + Σ(packaging_price)
```

- All prices are in **integer rupiah** (no decimals, no floating point).
- The preview is displayed immediately — no loading spinner, no debounce delay.

### Authoritative Quote

- Before the customer can proceed to checkout (step 7), the frontend sends a `POST /api/v1/pricing/quote` request with the full customization payload.
- The server recomputes the price using the canonical pricing engine and returns the authoritative total.
- If the authoritative quote differs from the preview (e.g., price version changed, rounding difference), the displayed price updates to the server value.
- A loading indicator ("Menghitung harga...") is shown during the quote request.

## 9. Validation Error Messages (Simple Indonesian)

All user-facing validation errors use simple, friendly Indonesian:

| Condition | Message |
|-----------|---------|
| No fragrance selected | "Pilih minimal satu aroma dulu, ya." |
| Fragrance ml below min | "Aroma {name} minimal {min} ml." |
| Fragrance ml above max | "Aroma {name} maksimal {max} ml." |
| Total fragrance exceeds volume | "Total aroma melebihi ukuran botol." |
| No volume selected | "Pilih ukuran botol dulu." |
| No bottle selected | "Pilih botol yang cocok untuk ukuran ini." |
| Bottle capacity mismatch | "Botol yang dipilih tidak cocok dengan ukuran." |
| Mandatory packaging not selected | "Pilih minimal satu kemasan." |
| Unavailable fragrance in config | "Aroma {name} sedang tidak tersedia." |
| Quote failed | "Gagal menghitung harga. Coba lagi, ya." |

## 10. Persistence

### Cart Item

- When the customer completes all steps and proceeds to checkout, the full customization is saved as a **cart item**.
- The cart item includes:
  - Product reference (fragrance IDs + ml per fragrance)
  - Volume (ml)
  - Strength setting (preset label or custom ml value)
  - Bottle ID
  - Packaging IDs (array)
  - Quantity (default 1)
  - Snapshot of the price at time of add-to-cart
- The customer can **edit customization** from the cart without losing the cart item. Editing re-runs the full customization flow pre-filled with saved values.

### Order Customizations

- On order creation, the cart item's customization data is **snapshotted** into the `order_customizations` table/record.
- This snapshot is immutable — it captures the exact configuration and prices at the moment of order placement.
- The snapshot is used for:
  - Order confirmation display
  - WhatsApp message generation
  - Admin order fulfillment
  - Audit trail
