# ATLASE — UI Screen Documentation

> Every screen documented with hierarchy, components, CTA, responsive behavior, motion, copy, and states.

---

## Table of Contents

1. [Home](#1-home)
2. [Collection (Aroma)](#2-collection-aroma)
3. [Product Detail](#3-product-detail)
4. [Customization (Buat Parfum)](#4-customization-buat-parfum)
5. [Cart](#5-cart)
6. [Address](#6-address)
7. [Checkout](#7-checkout)
8. [QRIS / Payment](#8-qris--payment)
9. [Order Success](#9-order-success)
10. [WhatsApp Handoff](#10-whatsapp-handoff)
11. [Admin Dashboard](#11-admin-dashboard)
12. [Admin Product / Fragrance](#12-admin-product--fragrance)
13. [Admin Pricing (+ Simulator)](#13-admin-pricing--simulator)
14. [Admin Orders](#14-admin-orders)
15. [Admin Customers](#15-admin-customers)

---

## 1. Home

### Purpose
Gateway page. Converts visitors into browsers within 3 seconds. Establishes luxury positioning while communicating affordability.

### Visual Hierarchy
1. **Navbar** — logo left, nav links center, cart icon + hamburger right
2. **Hero** — full-bleed product imagery, headline, subheadline, primary CTA
3. **Starting Price Strip** — "Mulai dari Rp29.000" above the fold, always visible
4. **Featured Fragrances** — 2-column grid (mobile) / 4-column (desktop)
5. **How It Works** — 3-step horizontal flow
6. **Build Your Perfume** — CTA section inviting customization
7. **Price/Value Comparison** — vs branded perfume pricing
8. **Premium Showcase** — editorial-style hero cards
9. **Testimonials** — horizontal scroll cards
10. **FAQ** — accordion list
11. **WhatsApp CTA** — floating + inline
12. **Footer** — links, social, legal

### Components
| Slot | Component | Notes |
|------|-----------|-------|
| Navbar | `Navbar` | Sticky, blurs on scroll, collapses to hamburger on mobile |
| Hero | `Hero` | Full viewport height on mobile, 80vh desktop |
| Price Strip | `Badge` + `PriceDisplay` | Static, no interaction |
| Featured | `ProductGrid` + `ProductCard` | Skeleton on load |
| How It Works | `Stepper` (display-only) | 3 numbered circles + text |
| Build | `Button` (MagneticButton desktop) | Single CTA block |
| Premium | `ProductCard` (variant: editorial) | Large image, minimal text |
| Testimonials | Horizontal scroll container | Touch-drag on mobile |
| FAQ | `Accordion` | Max 6 items |
| WhatsApp | `Button` (WhatsApp variant) | Floats bottom-right mobile, inline desktop |
| Footer | Static grid | 4-column desktop, stacked mobile |

### CTAs
- **Hero primary:** "Pilih Aroma"
- **Hero secondary:** "Buat Parfummu" (scrolls to Build section)
- **Build section:** "Mulai Sekarang"
- **WhatsApp float:** "Chat Kami"

### Copy (Bahasa Indonesia)
```
Headline: "Parfum Premium, Harga Terjangkau"
Subheadline: "Racik aroma unikmu sendiri atau pilih dari koleksi kami."
Price strip: "Mulai dari Rp29.000"
How it works title: "Cara Pesan"
Step 1: "Pilih Aroma"
Step 2: "Sesuaikan Preferensimu"
Step 3: "Pesan & Terima"
Build section title: "Buat Parfummu Sendiri"
Build section desc: "Campurkan aroma favoritmu, atur intensitas, pilih ukuran."
Premium title: "Koleksi Premium"
Testimonials title: "Apa Kata Mereka"
FAQ title: "Pertanyaan Umum"
WhatsApp CTA: "Pesan via WhatsApp"
```

### Responsive Behavior
- **Mobile (≤640px):** Hero full-bleed, single-column sections, sticky bottom WhatsApp button, hamburger nav, 2-col product grid
- **Tablet (641–1024px):** 2-col hero layout (image + text side by side), 2-col product grid, nav links visible
- **Desktop (1025–1440px):** 4-col product grid, horizontal how-it-works, large hero with parallax
- **Large Desktop (>1440px):** Max-width container (1280px), increased whitespace, larger typography scale

### Motion
| Level | Element | Animation |
|-------|---------|-----------|
| L4 | Hero | Subtle Ken Burns on background image, text fade-in stagger |
| L3 | Sections | Scroll-triggered reveal (fade-up + 20px translate) |
| L2 | Product cards | Hover float 4px up + shadow expansion |
| L1 | Buttons | Scale 0.98 on press, ripple on click |
| L1 | Nav | Blur backdrop on scroll past hero |

### States
| State | Behavior |
|-------|----------|
| Loading | Skeleton grid for Featured, skeleton hero block, nav visible |
| Empty | N/A (curated content, never empty) |
| Error | Toast: "Terjadi kesalahan. Silakan coba lagi." + retry fetch |
| Success | N/A (no form submission on home) |

---

## 2. Collection (Aroma)

### Purpose
Browse and filter the full fragrance catalog. Primary conversion funnel entry.

### Visual Hierarchy
1. **Page header** — "Koleksi Aroma" title + result count
2. **Filter bar** — category pills, sort dropdown, search input
3. **Product grid** — cards with image, name, notes, price, badge
4. **Pagination / Load more** — or infinite scroll

### Components
| Slot | Component | Notes |
|------|-----------|-------|
| Header | `Breadcrumb` + heading | Koleksi > [Category] if filtered |
| Filters | `Pill` (category), `Dropdown` (sort), `Input` (search) | Filters sticky on scroll |
| Grid | `ProductGrid` + `ProductCard` | Responsive columns |
| Pagination | `Button` (load more) or infinite scroll | Preference saved to localStorage |

### Filter Options
- **Category pills:** Semua, Floral, Woody, Fresh, Oriental, Gourmand
- **Sort dropdown:** Terpopuler, Harga Terendah, Harga Tertinggi, Terbaru, Rating Tertinggi
- **Search:** Real-time search by name or note keyword

### CTAs
- **Each card:** "Lihat Detail" (navigates to product detail)
- **Badge on card:** "POPULAR" / "NEW" / "BEST SELLER" / "PREMIUM" — informational only

### Responsive Behavior
- **Mobile:** 2-col grid, filters collapse into a "Filter" bottom sheet trigger, search always visible
- **Tablet:** 2–3 col grid, filters in a horizontal scrollable row
- **Desktop:** 3–4 col grid, sidebar filters (left) + grid (right), search in header

### Motion
| Level | Element | Animation |
|-------|---------|-----------|
| L3 | Grid items | Staggered fade-in on initial load and filter change |
| L2 | Card hover | Float + shadow |
| L1 | Filter pills | Scale on select, color transition |

### States
| State | Behavior |
|-------|----------|
| Loading | Skeleton grid (8–12 cards), filter bar visible but disabled |
| Empty | `EmptyState` — "Belum ada aroma untuk kategori ini." + "Lihat Semua" button |
| Error | `ErrorState` — "Gagal memuat koleksi." + retry button |
| Success | Grid populates, result count updates ("Menampilkan 24 aroma") |

---

## 3. Product Detail

### Purpose
Convince the user to buy or customize. Deep product information with clear path to purchase.

### Visual Hierarchy
1. **Product image** — large, swipeable gallery
2. **Product info** — name, brand line, rating, price
3. **Description** — scent notes, mood, occasion
4. **Size selector** — pill-based size options with price update
5. **Primary CTA** — "Buat Parfum Ini"
6. **Secondary CTA** — "Pesan via WhatsApp"
7. **Related products** — horizontal scroll

### Components
| Slot | Component | Notes |
|------|-----------|-------|
| Gallery | Image carousel (swipe on mobile) | 3–5 images, pinch-to-zoom |
| Info | Heading + `PriceDisplay` + `Badge` + rating stars | — |
| Notes | Accordion or tabbed: Top / Heart / Base notes | Visual note pyramid |
| Size | `Pill` group (size selector) | Updates price on select |
| CTA group | `Button` primary + `Button` secondary | Stacked mobile, inline desktop |
| Related | Horizontal scroll `ProductCard` row | 4+ items |

### CTAs
- **Primary:** "Buat Parfum Ini" → customization flow
- **Secondary:** "Pesan via WhatsApp" → opens WhatsApp with pre-filled message
- **Tertiary:** "Bagikan" → native share / copy link

### Copy (Bahasa Indonesia)
```
Size label: "Pilih Ukuran"
Notes title: "Catatan Aroma"
Top notes: "Top Notes"
Heart notes: "Heart Notes"
Base notes: "Base Notes"
Occasion: "Cocok Untuk"
Mood: "Suasana"
Rating: "4.8 dari 5 (120 ulasan)"
```

### Responsive Behavior
- **Mobile:** Full-width image gallery (swipe), info below, CTAs sticky at bottom
- **Tablet:** 2-column — gallery left (60%), info right (40%)
- **Desktop:** 2-column — gallery left (50%), info right (50%), related products below full-width

### Motion
| Level | Element | Animation |
|-------|---------|-----------|
| L2 | Gallery | Smooth swipe transition, parallax on scroll |
| L2 | Image zoom | Pinch gesture (mobile), scroll wheel (desktop) |
| L1 | Size pills | Scale + color transition on select |
| L1 | CTAs | MagneticButton on desktop, scale on press |
| L3 | Related | Scroll-triggered reveal |

### States
| State | Behavior |
|-------|----------|
| Loading | Skeleton gallery (aspect-ratio preserved), skeleton text lines |
| Empty | N/A (invalid product ID redirects to 404) |
| Error | `ErrorState` — "Produk tidak ditemukan." + back to collection |
| Success | Full render, images lazy-loaded, reviews loaded async |

---

## 4. Customization (Buat Parfum)

### Purpose
Step-by-step perfume builder with live price update. Core differentiator of ATLASE.

### Step Flow

#### Step 1 — Pilih Basis
- Select fragrance base (Eau de Parfum, Eau de Toilette, or Body Mist)
- Each base shows: description, price multiplier, longevity info
- **CTA:** "Selanjutnya"

#### Step 2 — Campur Aroma
- Pick 1–3 scent notes from categorized lists
- Visual scent wheel or categorized pill grid
- Live preview: scent profile text description updates
- **CTA:** "Selanjutnya"

#### Step 3 — Atur Preferensi
- Intensity slider (Light / Medium / Strong)
- Sweetness toggle (if applicable)
- Notes combination preview
- **CTA:** "Selanjutnya"

#### Step 4 — Pilih Ukuran & Harga
- Size pills: 10ml / 20ml / 30ml / 50ml
- **Live price display:** updates per combination
- Price breakdown visible: base + notes + size
- **CTA:** "Buat Parfum Ini" (adds to cart)

### Components
| Slot | Component | Notes |
|------|-----------|-------|
| Stepper | `Stepper` (4 steps) | Current step highlighted, completed steps checkmarked |
| Step content | `RadioGroup` / `Pill` / `Slider` / `Accordion` | Varies per step |
| Price | `PriceDisplay` (sticky, bottom or side) | Live-updating |
| Navigation | `Button` back + `Button` primary forward | — |

### Live Price Logic
```
Base price (per ml) × size ml × note multiplier × intensity modifier
Display: "Rp45.000" → updates on every change
Breakdown (expandable): "Basis: Rp20.000 + Aroma: Rp15.000 + Ukuran: Rp10.000"
```

### CTAs
- **Step navigation:** "Selanjutnya" / "Kembali"
- **Final step:** "Buat Parfum Ini"
- **Alternative:** "Pesan via WhatsApp" (pre-filled with customization details)

### Responsive Behavior
- **Mobile:** Full-width steps, price sticky at bottom, swipe between steps optional
- **Tablet:** Steps in left column (40%), preview + price in right column (60%)
- **Desktop:** Steps left (40%), live preview center (30%), price + CTA right (30%)

### Motion
| Level | Element | Animation |
|-------|---------|-----------|
| L1 | Step transitions | Slide left/right with spring easing |
| L1 | Price update | Number counter animation (0.3s) |
| L2 | Scent wheel | Rotation on selection |
| L3 | Step content | Fade-up on enter |

### States
| State | Behavior |
|-------|----------|
| Loading | Skeleton steps, disabled navigation |
| Empty | First step always has options — never empty |
| Error | "Terjadi kesalahan saat memuat opsi." + retry |
| Success (add to cart) | Toast: "Parfum ditambahkan ke keranjang!" + redirect to cart |

---

## 5. Cart

### Purpose
Review selected items before checkout. Upsell opportunity.

### Visual Hierarchy
1. **Cart header** — "Keranjangmu" + item count
2. **Cart items** — image, name, customization details, size, quantity, price
3. **Remove/edit controls** — per item
4. **Upsell section** — "Mungkin Kamu Suka" (2–3 recommendations)
5. **Order summary** — subtotal, shipping estimate, total
6. **CTA** — "Lanjut ke Pengiriman"

### Components
| Slot | Component | Notes |
|------|-----------|-------|
| Header | Heading + count badge | — |
| Items | `CartItem` card | Swipe-to-delete on mobile |
| Quantity | `QuantitySelector` | Inline in each card |
| Upsell | Horizontal `ProductCard` scroll | 2–3 items |
| Summary | Sticky bottom bar (mobile) / sidebar (desktop) | — |
| CTA | `Button` primary | — |

### CTAs
- **Primary:** "Lanjut ke Pengiriman"
- **Secondary:** "Pesan via WhatsApp" (order via chat)
- **Per item:** "Edit" → returns to customization, "Hapus" → remove

### Responsive Behavior
- **Mobile:** Single column, summary sticky at bottom, swipe-to-delete
- **Tablet/Desktop:** Items list left (65%), summary sidebar right (35%)

### Motion
| Level | Element | Animation |
|-------|---------|-----------|
| L1 | Remove | Slide out + fade, height collapse |
| L1 | Quantity change | Price counter update |
| L3 | Upsell reveal | Scroll-triggered |

### States
| State | Behavior |
|-------|----------|
| Loading | Skeleton item cards (3 slots) |
| Empty | `EmptyState` — "Keranjangmu kosong." + "Mulai Belanja" button → collection |
| Error | "Gagal memuat keranjang." + retry |
| Success | Items render, summary calculates |

---

## 6. Address

### Purpose
Collect delivery address. Can be skipped if ordering via WhatsApp.

### Visual Hierarchy
1. **Page header** — "Alamat Pengiriman"
2. **Saved addresses** (if any) — selectable list
3. **Add new address form** — or edit existing
4. **Map preview** — approximate delivery area
5. **CTA** — "Lanjut ke Pembayaran"

### Components
| Slot | Component | Notes |
|------|-----------|-------|
| Header | Breadcrumb + heading | Keranjang > Alamat |
| Saved | Address card (radio select) | Checkmark on selected |
| Form | `AddressForm` — Name, Phone, Address, City, Province, Postal, Note | — |
| Map | Static map preview or placeholder | — |
| CTA | `Button` primary | — |

### Form Fields
| Field | Component | Validation |
|-------|-----------|------------|
| Nama Lengkap | `Input` | Required, min 2 chars |
| Nomor HP | `PhoneInput` | Required, valid Indonesian format (08xx) |
| Alamat | `Textarea` | Required, min 10 chars |
| Kota/Kabupaten | `Input` or `Combobox` | Required |
| Provinsi | `Input` or `Combobox` | Required |
| Kode Pos | `Input` | Required, 5 digits |
| Catatan | `Textarea` (optional) | Max 200 chars |

### CTAs
- **Primary:** "Lanjut ke Pembayaran"
- **Form:** "Simpan Alamat" (if adding new)

### Responsive Behavior
- **Mobile:** Full-width form, saved addresses stacked, CTA sticky at bottom
- **Desktop:** 2-column — saved addresses left, form right (or modal for add/edit)

### Motion
| Level | Element | Animation |
|-------|---------|-----------|
| L1 | Address select | Checkmark animation |
| L1 | Form validation | Inline error slide-in |

### States
| State | Behavior |
|-------|----------|
| Loading | Skeleton form fields |
| Empty (no saved) | Form shown directly, no saved list |
| Error | "Gagal menyimpan alamat." + retry |
| Success | Toast: "Alamat tersimpan." + proceed to checkout |

---

## 7. Checkout

### Purpose
Final review before payment. Everything on one screen.

### Visual Hierarchy
1. **Order items** — condensed list from cart
2. **Delivery address** — selected address with edit link
3. **Shipping option** — standard / express with price
4. **Promo code** — optional input
5. **Order summary** — subtotal, shipping, discount, total
6. **Payment method** — QRIS selected by default, WhatsApp option
7. **CTA** — "Bayar dengan QRIS"

### Components
| Slot | Component | Notes |
|------|-----------|-------|
| Items | Condensed cart item list | Image + name + qty + price |
| Address | Address summary card | "Ubah" link → address step |
| Shipping | `RadioGroup` | Standard (Rp5.000) / Express (Rp15.000) |
| Promo | `Input` + `Button` "Gunakan" | — |
| Summary | Price breakdown | — |
| Payment | `RadioGroup` | QRIS / WhatsApp |
| CTA | `Button` primary (full-width) | — |

### CTAs
- **Primary:** "Bayar dengan QRIS" (if QRIS selected) / "Pesan via WhatsApp" (if WhatsApp selected)
- **Secondary:** "Kembali ke Keranjang"

### Responsive Behavior
- **Mobile:** Single column, all sections stacked, CTA sticky bottom
- **Desktop:** 2-column — details left (60%), summary + CTA right (40%)

### Motion
| Level | Element | Animation |
|-------|---------|-----------|
| L1 | Promo apply | Success checkmark / error shake |
| L1 | Price update | Number counter on discount apply |

### States
| State | Behavior |
|-------|----------|
| Loading | Skeleton sections |
| Empty | Redirect to cart |
| Error | "Gagal memuat checkout." + retry |
| Success | Redirect to QRIS payment screen |

---

## 8. QRIS / Payment

### Purpose
Display QRIS code for payment. Wait for confirmation.

### Visual Hierarchy
1. **Payment header** — "Menunggu Pembayaran"
2. **QRIS code** — large, centered, scannable
3. **Amount** — total to pay, prominent
4. **Timer** — countdown (15 minutes typical)
5. **Instructions** — how to pay with QRIS
6. **Status** — polling for payment confirmation
7. **CTA** — "Saya Sudah Bayar" / "Batalkan Pesanan"

### Components
| Slot | Component | Notes |
|------|-----------|-------|
| Header | Heading + order number | — |
| QR | QR code image (generated server-side) | Downloadable |
| Amount | `PriceDisplay` (large) | — |
| Timer | Countdown component | Auto-cancel at 0 |
| Instructions | Numbered list | — |
| Status | Polling indicator | Checks every 5s |
| CTA | `Button` primary + `Button` ghost | — |

### CTAs
- **Primary:** "Saya Sudah Bayar" (manual confirmation trigger)
- **Danger:** "Batalkan Pesanan"
- **Secondary:** "Bayar via WhatsApp" (fallback)

### Responsive Behavior
- **Mobile:** QR code fills width, timer and instructions below
- **Desktop:** QR code centered with instructions in sidebar

### Motion
| Level | Element | Animation |
|-------|---------|-----------|
| L1 | Timer | Pulse when < 2 min remaining |
| L1 | Status | Subtle polling spinner |
| L4 | Success | Confetti or checkmark animation on payment confirmed |

### States
| State | Behavior |
|-------|----------|
| Loading | Generating QR code, skeleton |
| Pending | QR displayed, timer counting, polling active |
| Paid | Success animation, redirect to order success (3s delay) |
| Expired | "Kode QR sudah kedaluwarsa." + "Buat Pesanan Baru" |
| Error | "Gagal memuat kode QR." + retry / WhatsApp fallback |

---

## 9. Order Success

### Purpose
Confirm order, reduce anxiety, set expectations.

### Visual Hierarchy
1. **Success icon** — animated checkmark
2. **Headline** — "Pesanan Berhasil!"
3. **Order number** — copyable
4. **Summary** — items, total, delivery address
5. **Expected delivery** — date range
6. **CTA group** — track order, continue shopping, share

### Components
| Slot | Component | Notes |
|------|-----------|-------|
| Icon | Animated checkmark (L4 motion) | — |
| Headline | Heading | — |
| Order # | `Badge` + copy button | — |
| Summary | Condensed order details | — |
| Delivery | Info block | — |
| CTAs | `Button` group | — |

### CTAs
- **Primary:** "Lacak Pesanan"
- **Secondary:** "Lanjut Belanja"
- **Tertiary:** "Bagikan ke Teman" → native share

### Copy
```
Headline: "Pesanan Berhasil!"
Subtitle: "Parfummu sedang disiapkan."
Delivery: "Estimasi pengiriman: 3–5 hari kerja"
WhatsApp note: "Kami akan mengirimkan update via WhatsApp."
```

### Responsive Behavior
- **Mobile:** Centered single column, generous whitespace
- **Desktop:** Centered card (max-width 600px) with background imagery

### Motion
| Level | Element | Animation |
|-------|---------|-----------|
| L4 | Checkmark | Draw-on animation + scale bounce |
| L3 | Content | Staggered fade-in below checkmark |

### States
| State | Behavior |
|-------|----------|
| Loading | N/A (brief transition from payment) |
| Error | "Gagal memuat detail pesanan." + order lookup by number |

---

## 10. WhatsApp Handoff

### Purpose
Seamless transition from web to WhatsApp for orders placed via chat.

### Trigger
User clicks "Pesan via WhatsApp" from any screen.

### Behavior
1. Generate pre-filled WhatsApp message with:
   - Product name(s)
   - Customization details (if applicable)
   - Size, quantity, price
   - Delivery address (if collected)
2. Open `wa.me/{number}?text={encoded_message}`
3. Show interim screen while WhatsApp opens

### Interim Screen Components
| Slot | Component | Notes |
|------|-----------|-------|
| Icon | WhatsApp logo | — |
| Heading | "Mengarahkan ke WhatsApp..." | — |
| Fallback | Manual link + copy number | If WhatsApp doesn't open |
| Message preview | Card showing pre-filled message | — |

### CTAs
- **Primary:** "Buka WhatsApp" (manual fallback link)
- **Secondary:** "Salin Nomor" → clipboard
- **Tertiary:** "Salin Pesan" → clipboard

### Responsive Behavior
- Same layout across all breakpoints (simple centered card)

### States
| State | Behavior |
|-------|----------|
| Loading | "Mengarahkan ke WhatsApp..." with spinner |
| Success | WhatsApp app/tab opens |
| Error | Fallback link + manual number display |

---

## 11. Admin Dashboard

### Purpose
Overview for store management. Key metrics at a glance.

### Visual Hierarchy
1. **Sidebar** — navigation (always visible desktop, hamburger mobile)
2. **Top bar** — search, notifications, admin avatar
3. **Metrics cards** — revenue, orders, customers, conversion
4. **Charts** — revenue over time, top products
5. **Recent orders** — table with status badges
6. **Quick actions** — add product, view alerts

### Components
| Slot | Component | Notes |
|------|-----------|-------|
| Sidebar | `Sidebar` navigation | Collapsible on tablet |
| Metrics | `MetricCard` (4-up grid) | Icon + number + trend |
| Charts | Chart.js or Recharts | Revenue line, product bar |
| Orders | `DataTable` (recent 10) | Sortable, filterable |
| Actions | `Button` quick actions | — |

### Sidebar Navigation
```
- Dashboard
- Produk
- Aroma
- Pesanan
- Pelanggan
- Harga & Simulator
- Pengaturan
```

### Responsive Behavior
- **Mobile:** Sidebar becomes bottom tab bar or hamburger overlay
- **Tablet:** Collapsible sidebar (icons only when collapsed)
- **Desktop:** Fixed sidebar (240px) + content area

### Motion
| Level | Element | Animation |
|-------|---------|-----------|
| L1 | Sidebar | Smooth expand/collapse |
| L3 | Metric cards | Count-up number animation on load |

### States
| State | Behavior |
|-------|----------|
| Loading | Skeleton metrics + skeleton table rows |
| Error | "Gagal memuat dashboard." + retry |

---

## 12. Admin Product / Fragrance

### Purpose
CRUD for products and fragrance notes.

### Visual Hierarchy
1. **Tab bar** — "Produk" / "Catatan Aroma"
2. **Toolbar** — search, filter, sort, "Tambah Baru" button
3. **Table** — paginated product/fragrance list
4. **Inline actions** — edit, duplicate, toggle active, delete
5. **Detail panel** — slide-out or modal for edit form

### Product Table Columns
```
Gambar | Nama | Kategori | Harga Mulai | Status (Aktif/Nonaktif) | Aksi
```

### Fragrance Note Table Columns
```
Nama | Kategori (Top/Heart/Base) | Harga per ml | Deskripsi | Aksi
```

### CTAs
- **Primary:** "Tambah Produk" / "Tambah Catatan"
- **Per row:** Edit (pencil icon), Duplicate (copy icon), Toggle (switch), Delete (trash icon)

### Responsive Behavior
- **Mobile:** Table becomes card list (each row = card)
- **Tablet/Desktop:** Full data table with sortable headers

### States
| State | Behavior |
|-------|----------|
| Loading | Skeleton table rows (5) |
| Empty | `EmptyState` — "Belum ada produk." + "Tambah Produk Pertama" |
| Error | "Gagal memuat data." + retry |
| Success (delete) | Confirm modal → toast: "Produk dihapus." + undo option |

---

## 13. Admin Pricing (+ Simulator)

### Purpose
Manage pricing tiers and test pricing logic with the simulator.

### Visual Hierarchy
1. **Pricing tiers table** — base prices per ml by type
2. **Size pricing** — markup per size tier
3. **Note pricing** — cost per fragrance note category
4. **Simulator panel** — interactive pricing calculator
5. **Bulk update** — CSV upload or batch edit

### Simulator Components
| Input | Component | Effect |
|-------|-----------|--------|
| Base type | `Dropdown` | Changes base multiplier |
| Notes (1–3) | `Combobox` multi-select | Adds note costs |
| Intensity | `Slider` | Light (0.8x) / Medium (1x) / Strong (1.2x) |
| Size | `Dropdown` | Applies size pricing |
| Output | `PriceDisplay` | Calculated price + breakdown |

### CTAs
- **Primary:** "Simpan Perubahan Harga"
- **Simulator:** "Reset" / "Salin Hasil"
- **Bulk:** "Unggah CSV" / "Ekspor Template"

### Responsive Behavior
- **Mobile:** Simulator stacks below table, collapsible
- **Desktop:** Table left (60%), simulator sticky right (40%)

### States
| State | Behavior |
|-------|----------|
| Loading | Skeleton table + disabled simulator |
| Error | "Gagal memuat data harga." + retry |
| Success (save) | Toast: "Harga berhasil diperbarui." |

---

## 14. Admin Orders

### Purpose
View and manage all customer orders.

### Visual Hierarchy
1. **Status filter tabs** — Semua, Menunggu Bayar, Diproses, Dikirim, Selesai, Dibatalkan
2. **Search bar** — by order number, customer name, phone
3. **Orders table** — paginated, sortable
4. **Order detail** — expandable row or slide-out panel

### Table Columns
```
No. Pesanan | Pelanggan | Item | Total | Status | Tanggal | Aksi
```

### Status Badges
| Status | Color | Label |
|--------|-------|-------|
| Pending payment | Yellow | Menunggu Bayar |
| Paid | Blue | Dibayar |
| Processing | Purple | Diproses |
| Shipped | Teal | Dikirim |
| Delivered | Green | Selesai |
| Cancelled | Red | Dibatalkan |

### Order Detail Panel
- Customer info (name, phone, address)
- Item list with customization details
- Payment status + method
- Shipping info + tracking
- Timeline/log of status changes
- Actions: Update status, Add note, Print

### CTAs
- **Per order:** "Detail" / "Ubah Status" / "Hubungi Pelanggan" (WhatsApp link)
- **Bulk:** "Ekspor CSV"

### Responsive Behavior
- **Mobile:** Card list instead of table, detail as full-screen modal
- **Desktop:** Full data table with expandable rows

### States
| State | Behavior |
|-------|----------|
| Loading | Skeleton table (10 rows) |
| Empty (filter) | "Tidak ada pesanan dengan status ini." |
| Error | "Gagal memuat pesanan." + retry |

---

## 15. Admin Customers

### Purpose
View customer list, order history, contact info.

### Visual Hierarchy
1. **Search bar** — by name, phone, email
2. **Customers table** — paginated
3. **Customer detail** — slide-out with order history

### Table Columns
```
Nama | Telepon | Email | Total Pesanan | Total Belanja | Terakhir Aktif | Aksi
```

### Customer Detail Panel
- Contact info
- All orders (linked to order detail)
- Total spend / average order value
- Customization preferences (most ordered notes)
- Actions: "Hubungi via WhatsApp", "Lihat Semua Pesanan"

### CTAs
- **Per customer:** "Detail" / "Hubungi" (WhatsApp)
- **Bulk:** "Ekspor CSV"

### Responsive Behavior
- **Mobile:** Card list, detail as full-screen
- **Desktop:** Table + slide-out panel

### States
| State | Behavior |
|-------|----------|
| Loading | Skeleton table |
| Empty (search) | "Tidak ditemukan pelanggan yang cocok." |
| Error | "Gagal memuat data pelanggan." + retry |

---

## Cross-Screen Patterns

### Navigation
- **Mobile:** Bottom tab bar (Home, Koleksi, Keranjang, Profil) + hamburger for secondary
- **Desktop:** Top navbar with mega-menu dropdowns
- **Admin:** Left sidebar (always)

### Cart Indicator
- Badge count on cart icon, all screens
- Pulse animation on add-to-cart

### Toast Notifications
- Position: bottom-center (mobile), bottom-right (desktop)
- Duration: 4s auto-dismiss, manual dismiss available
- Types: success (green), error (red), info (ivory), warning (amber)

### Loading Patterns
- Skeleton screens (not spinners) for content areas
- Inline spinners for button actions
- Progress bars for file uploads

### Error Recovery
- Every error state includes a retry action
- Network errors show offline indicator banner
- Form errors are inline (not modals)
