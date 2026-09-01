# ATLASE — Content & Merchandising Guide

All copy and content decisions for the storefront. Editorial voice: Indonesian simple language, no perfume jargon, approachable luxury. Every piece of content should answer: *"Would a 22-year-old in Jakarta reading this on their phone during lunch break understand it instantly?"*

---

## 1. Launch Content Plan

### Hero Section

| Element | Copy (ID) | Copy (EN) | Notes |
|---------|-----------|-----------|-------|
| **Headline** | Parfum Premium, Sesuai Kamu. | Premium, Made Personal. | Primary brand tagline |
| **Subheadline** | Wangi Mewah. Harga Bersahabat. | Luxury Scent. Friendly Price. | Hook / value proposition |
| **CTA** | Mulai dari Rp29.000 | Starting from Rp29.000 | Price psychology anchor — always show lowest entry point |
| **Secondary CTA** | Buat Parfummu Sendiri | Build Your Own Perfume | Customization feature callout |

### Featured Fragrances (4–6 slots)

Rotate featured selections monthly. Selection criteria:
- At least 1 from each scent family (woody, fresh, floral, sweet, gourmand)
- Mix of POPULAR and NEW pills
- Minimum 1 with highest margin

Each featured card shows:
- Product name (inspired-by reference name)
- Scent category pill
- Size selector (30ml / 50ml / 100ml)
- Price per ml in small text
- Primary product image (dark bg, soft light)

### How It Works (3 Steps)

| Step | Icon | Title (ID) | Description (ID) |
|------|------|-----------|------------------|
| 1 | 🧪 | Pilih Wanginya | Pilih dari koleksi kami yang terinspirasi parfum premium dunia. |
| 2 | 📏 | Tentukan Ukuran | 30ml untuk coba-coba, 50ml untuk sehari-hari, 100ml untuk yang yakin banget. |
| 3 | 📦 | Kami Kirim | Parfummu dikemas rapi dan dikirim ke seluruh Indonesia. |

### Testimonials Placeholder Policy

- **Do NOT fabricate testimonials.** Launch with a "Coming Soon" or "Testimoni dari Pelanggan Kami" placeholder.
- After first 10 orders, collect real feedback via WhatsApp follow-up.
- Only publish testimonials with explicit customer consent (screenshot or written).
- Format: first name + city only (e.g., "Rina, Jakarta"). No full names, no photos unless explicitly given.

### FAQ

Seed from copywriting.md reference. Minimum 8 questions covering:
- Apa itu ATLASE?
- Parfum ini original?
- Berapa lama wanginya tahan?
- Bisa campur sendiri wanginya?
- Cara pesan gimana?
- Bayarnya gimana? (QRIS / transfer)
- Pengiriman ke mana aja?
- Bisa refund atau tukar?

### WhatsApp CTA

- **Floating button** on all pages (mobile-first).
- Pre-filled message: `Halo ATLASE, saya mau tanya tentang parfumnya!`
- Opens WhatsApp Business number (configured in admin).
- Desktop: show as inline banner above footer instead of floating.

---

## 2. Demo Seed Catalog

| # | Product Name | Inspired By | Category | Min/Max ml | Price per ml | Pill |
|---|-------------|-------------|----------|------------|-------------|------|
| 1 | **Sauvage-inspired** | Dior Sauvage | Fresh Spicy | 30 / 100 ml | Rp 3.000 | POPULAR |
| 2 | **Baccarat-inspired** | Baccarat Rouge 540 | Woody Amber | 30 / 100 ml | Rp 3.500 | PREMIUM |
| 3 | **Aventus-inspired** | Creed Aventus | Fruity Woody | 30 / 100 ml | Rp 3.200 | BEST SELLER |
| 4 | **Black Opium-inspired** | YSL Black Opium | Sweet Gourmand | 30 / 100 ml | Rp 2.800 | NEW |
| 5 | **Chance-inspired** | Chanel Chance Eau Tendre | Fresh Floral | 30 / 100 ml | Rp 2.500 | POPULAR |
| 6 | **Tobacco Vanille-inspired** | TF Tobacco Vanille | Gourmand | 30 / 100 ml | Rp 3.000 | NEW |

### Price Example

**Sauvage-inspired, 50ml:**
`50 × Rp3.000 = Rp150.000`

Displayed as: **Rp150.000** (with ~~Rp175.000~~ strikethrough on the 100ml tier to show volume savings).

### Product Description Template

Each product gets:
1. **One-liner** — 1 sentence, punchy, no jargon. (e.g., "Wangi segar yang bikin kamu keliatan wibawa tanpa harus banyak bicara.")
2. **Scent notes** — Top / Middle / Base, max 3 each, in plain Indonesian.
3. **Occasion tags** — Kencan, Kantor, Sehari-hari, Pesta, etc.
4. **Longevity** — Tahan 4–6 jam / 6–8 jam / 8+ jam (based on concentration).

---

## 3. Merchandising Rules

### Pill System

| Pill | Color | When to Use |
|------|-------|-------------|
| **POPULAR** | Blue | Top 3 by order count in last 30 days |
| **NEW** | Green | Added within last 30 days |
| **PREMIUM** | Gold | Price per ml ≥ Rp3.200 |
| **BEST SELLER** | Red | Highest total revenue in last 30 days |

### Featured Selection Algorithm

1. Max 6 products on homepage featured section.
2. At least 1 from each scent family represented.
3. No more than 2 from same category.
4. Refresh monthly or when inventory changes significantly.
5. Admin can manually override via admin panel (Phase 8).

### Sorting Default

Catalog default sort: **POPULAR** (by order count, descending).
Secondary sorts: Price low–high, Price high–low, Newest, A–Z.

---

## 4. Editorial Tone Reminders

- **Indonesian simple.** Write like you're texting a friend, not writing a perfume encyclopedia.
- **No jargon.** Avoid "oud", "bergamot", "ambergris" without explanation. If used, add a parenthetical. E.g., "oud (kayu yang wanginya kaya dan hangat)."
- **Confident, not arrogant.** "Wangi ini bakal bikin kamu percaya diri" ✅ "The ultimate olfactory experience" ❌
- **Price-forward.** Always anchor on affordability. "Mulai dari Rp29.000" is the most important number.
- **Inspired-by, never "same as."** Always use "Terinspirasi oleh [reference]" — never "parfum [brand]" or "[brand] original."
- **Mobile-first copy.** Sentences under 15 words. Paragraphs under 3 lines on mobile.

---

## 5. Image/Asset Checklist Per Product

Every product MUST have these assets before going live:

| # | Asset | Slot | Required | Notes |
|---|-------|------|----------|-------|
| 1 | Primary image | `primary_image` | ✅ Yes | Dark bg, full bottle, soft light |
| 2 | Thumbnail | `thumbnail` | ✅ Yes | Auto-generated from primary or 800×800 crop |
| 3 | Product detail image | `desktop_image` | ✅ Yes | High-res for PDP hero |
| 4 | Mobile image | `mobile_image` | ✅ Yes | Cropped/compressed for mobile PDP |
| 5 | OG image | — | ✅ Yes | 1200×630, product + ATLASE wordmark |
| 6 | Gallery 1 | `gallery[0]` | ⚡ Recommended | Alternate angle |
| 7 | Gallery 2 | `gallery[1]` | ⚡ Recommended | Close-up / lifestyle |
| 8 | Transparent cutout | `transparent_image` | ⚡ Recommended | For customization builder |
| 9 | Hover image | `hover_image` | 🔵 Optional | Slight zoom or alternate angle for desktop hover |

**Minimum to publish:** Primary image + OG image + product description.
**Recommended for full experience:** All 9 assets.

---

## 6. Content Governance

| Who | Can Edit | Cannot Edit |
|-----|----------|-------------|
| **Admin (store owner)** | Product names, descriptions, prices, images, featured selection, FAQ, hero copy, pills | Code, database schema, infrastructure config |
| **Developer** | Code, schema, infrastructure, asset pipeline, CMS structure | Product content (unless acting as admin) |
| **Customer** | Nothing — read-only browsing | — |

### Content Update Workflow

1. Admin logs into admin panel (Phase 8).
2. Edits product content directly — no code change required.
3. Changes go live immediately (or on publish toggle).
4. Asset uploads go through the image pipeline (compression + naming + licensing log).
5. No developer intervention needed for routine content updates.

### What Requires Developer

- Adding new pill types
- Changing page layout or component structure
- Schema migrations
- Adding new content sections to the storefront
- Performance or SEO infrastructure changes
