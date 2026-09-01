# ATLASE — Asset & Image Specifications

All visual assets must reinforce the brand promise: **luxury look at affordable prices**. Dark backgrounds, soft directional light, subtle reflection, premium bottle silhouette, minimal composition, editorial photography feel. Never scrape or illegally reuse branded photography from other houses — use licensed stock, original photography, or AI-generated imagery styled to ATLASE brand. Dribbble/design galleries are references only, never production assets.

---

## 1. Image Requirements by Slot

| Slot | Purpose | Recommended Size | Aspect Ratio | Max Bytes | Notes |
|------|---------|-----------------|--------------|-----------|-------|
| **hero** | Landing page full-width banner | 2400 × 1200 px | 2:1 | 300 KB | Dark moody composition, bottle hero, negative space for copy overlay |
| **product-card** | Catalog grid thumbnail | 800 × 800 px | 1:1 | 120 KB | Tight crop, clean background, consistent lighting across all cards |
| **product-detail** | PDP main image | 1600 × 1600 px | 1:1 | 250 KB | Full bottle + cap, soft shadow on dark surface |
| **gallery** | PDP secondary angles | 1200 × 1200 px | 1:1 | 200 KB | Up to 6 per product — nozzle close-up, lifestyle context, ingredient vignette |
| **transparent** | Cut-out bottle on any bg | 1200 × 1600 px | 3:4 | 150 KB | PNG/WebP with alpha; used on customization builder and promo sections |
| **OG image** | Social share preview | 1200 × 630 px | ~1.91:1 | 200 KB | Product + ATLASE wordmark + "Mulai dari Rp29.000" badge |

---

## 2. Formats & Compression

| Format | Role | Notes |
|--------|------|-------|
| **AVIF** | Primary delivery | Best compression; serve to browsers that support it |
| **WebP** | Fallback | Universally supported; always generate alongside AVIF |
| **JPEG** | Legacy fallback only | For environments that reject both AVIF and WebP |

- Use `<picture>` with AVIF source → WebP source → JPEG fallback.
- Target **≤80% quality** for WebP; **≤65% quality** for AVIF to hit byte budgets.
- Run images through a pipeline (Sharp, Squoosh, or Imagemagick) before upload.
- No raw/uncompressed PNGs in production unless transparency is required.

---

## 3. Naming Convention

All asset filenames follow **kebab-case** with a **slot suffix**:

```
{product-slug}__{slot}.{format}
```

Examples:
```
sauvage-inspired__primary.webp
sauvage-inspired__primary.avif
sauvage-inspired__gallery-1.webp
sauvage-inspired__transparent.png
sauvage-inspired__og.jpg
baccarat-inspired__product-card.avif
```

Rules:
- `product-slug` = URL-safe kebab-case of the product name (e.g. `sauvage-inspired`, `baccarat-inspired`).
- Slot suffix uses double underscore `__` separator.
- Gallery images append a numeric index: `gallery-1`, `gallery-2`, etc.
- No spaces, no underscores (except the `__` slot separator), no uppercase in filenames.

---

## 4. Licensing

### Allowed Sources

| Source Type | Approach |
|-------------|----------|
| **Original photography** | Preferred. Photograph ATLASE-branded bottles on controlled dark-background sets. |
| **AI-generated imagery** | Acceptable. Generate ATLASE-branded bottle concepts; style must match brand direction (dark, editorial, premium). |
| **Truly free stock** | Acceptable with verification. Use only images explicitly licensed for commercial use **without attribution** (Unsplash, Pexels — verify license per image before use). |

### Prohibited

- Scraping or downloading branded photography from competitor sites.
- Using images found on Dribbble, Behance, or Pinterest without explicit commercial license.
- Any image whose provenance cannot be documented.

### Attribution Records

Maintain an `assets/licensing-log.csv` with columns:

```
filename, source, license_url, author, date_acquired, notes
```

Every asset uploaded to production must have a corresponding row in this log.

---

## 5. Temporary vs Final Assets

| Phase | Asset Type | Rule |
|-------|-----------|------|
| **Development / staging** | Stock placeholders | Permitted. Must be visually consistent with brand direction. |
| **Production launch** | Stock placeholders | **NOT permitted.** All production images must be original photography, licensed stock with verified provenance, or AI-generated ATLASE imagery. |
| **Replacement workflow** | Placeholder → final | Temporary assets are tagged `TODO:replace` in the asset log. Every sprint reviews this tag and prioritizes replacements. |

**Never ship unlicensed or unattributed imagery to production.**

---

## 6. Alt Text Guidance

Every image must have meaningful alt text for accessibility and SEO.

| Slot | Alt Text Pattern | Example |
|------|-----------------|---------|
| hero | `{brand} {vibe} — {tagline}` | `ATLASE premium fragrance on dark surface — Parfum Premium, Sesuai Kamu` |
| product-card | `{product name} — {category} perfume` | `Sauvage-inspired — Fresh spicy men's perfume` |
| product-detail | `{product name} {detail type}` | `Sauvage-inspired bottle front view` |
| gallery | `{product name} — {angle/description}` | `Sauvage-inspired nozzle close-up` |
| transparent | `{product name} — transparent cutout` | `Baccarat-inspired transparent bottle cutout` |
| OG | `{product name} — {category} — ATLASE` | `Aventus-inspired — Fruity woody perfume — ATLASE` |

Rules:
- Never use `image1.jpg` or `photo` as alt text.
- Include the product name for SEO.
- Keep under 125 characters.
- Skip "image of" or "photo of" — screen readers already announce it.

---

## 7. Delivery Infrastructure

| Layer | Technology | Notes |
|-------|-----------|-------|
| **Storage** | Supabase Storage (S3-compatible) | Bucket per environment: `atlase-assets-prod`, `atlase-assets-staging` |
| **CDN** | Supabase CDN / Cloudflare | Automatic when serving from Supabase Storage public URLs |
| **Responsive URLs** | Supabase image transformations | Append `?width=800&format=webp` for on-the-fly resizing; pre-generate critical sizes to avoid runtime transforms |
| **Caching** | `Cache-Control: public, max-age=31536000, immutable` | Assets are versioned by filename; long cache is safe |
| **Lazy loading** | Native `loading="lazy"` on non-hero images | Hero image uses `loading="eager"` + `fetchpriority="high"` |

### Upload Workflow

1. Process images through compression pipeline (hit byte budgets above).
2. Name files per §3 convention.
3. Upload to Supabase Storage via admin panel or script.
4. Record in `assets/licensing-log.csv`.
5. Link to product via `primary_image`, `thumbnail`, `gallery`, etc. fields in the product table.
