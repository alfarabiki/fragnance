# ATLASE — Performance Targets & Strategy

## 1. Targets Table

| Metric | Target | Device / Network | Measurement |
|--------|--------|------------------|-------------|
| LCP (Largest Contentful Paint) | **< 2.5s** | Mid-range Android (Moto G Power), 4G | Lighthouse throttled + CrUX RUM |
| INP (Interaction to Next Paint) | **< 200ms** | Mid-range Android, 4G | Lighthouse + RUM |
| CLS (Cumulative Layout Shift) | **< 0.1** | Any device | Lighthouse + RUM |
| TTFB (Time to First Byte) | **< 800ms** | Mid-range Android, 4G | Lighthouse throttled |
| JS budget (initial load) | **< 200KB gzip** | — | `size-limit` in CI |
| Image budget (LCP image) | **< 150KB** | — | CI image audit |
| Total page weight | **< 500KB** | — | Lighthouse |
| First Contentful Paint | **< 1.8s** | Mid-range Android, 4G | Lighthouse |

**"Mid-range Android" definition:** Snapdragon 6-series, 4GB RAM, Android 12+, Chrome latest. Examples: Moto G Power, Samsung Galaxy A53, Xiaomi Redmi Note 12.

## 2. Image Pipeline

### Format Strategy

| Format | Usage | Notes |
|--------|-------|-------|
| AVIF | Primary (all product + OG images) | Best compression, 30-50% smaller than WebP |
| WebP | Fallback for older browsers | `<picture>` element with AVIF source, WebP fallback |
| JPEG | Final fallback | Only for browsers supporting neither AVIF nor WebP (rare) |

### Responsive Images

```html
<picture>
  <source
    srcset="/images/aroma/dior-inspired-400.avif 400w, /images/aroma/dior-inspired-800.avif 800w, /images/aroma/dior-inspired-1200.avif 1200w"
    type="image/avif"
  />
  <source
    srcset="/images/aroma/dior-inspired-400.webp 400w, /images/aroma/dior-inspired-800.webp 800w, /images/aroma/dior-inspired-1200.webp 1200w"
    type="image/webp"
  />
  <img
    src="/images/aroma/dior-inspired-800.jpg"
    alt="Dior Sauvage Inspired — ATLASE"
    width="800"
    height="600"
    loading="lazy"
    fetchpriority="low"
  />
</picture>
```

### Dimensions Table

| Context | Widths (srcset) | Aspect Ratio | Max File Size |
|---------|-----------------|--------------|---------------|
| Product card (grid) | 400w, 800w | 1:1 | 60KB |
| Product detail hero | 400w, 800w, 1200w | 4:3 | 120KB (LCP image target < 150KB) |
| OG / social share | 1200w | 1200×630 | 100KB |
| Customization preview | 400w, 800w | 1:1 | 50KB |
| Brand assets (logo, icons) | SVG preferred | — | < 5KB |

### Loading Rules

| Position | `loading` | `fetchpriority` | Reason |
|----------|-----------|-----------------|--------|
| Above the fold (hero, first product) | `eager` | `high` | LCP candidate — must load immediately |
| Below the fold (grid items, secondary images) | `lazy` | `low` | Defer until visible |
| OG images | N/A (meta tag) | N/A | Preloaded by browser for social crawlers |

### Build Pipeline

- Images stored in `/public/images/` or Supabase Storage.
- Build step generates AVIF + WebP variants at each width using `sharp` (Node.js).
- Filenames include dimensions for cache-busting: `{name}-{width}.avif`.
- Next.js `<Image>` component handles `srcset` generation automatically when using the `sizes` prop.

## 3. Font Loading

### Font Stack

| Role | Font | Source | Subset |
|------|------|--------|--------|
| Display (headings, logo) | Brand display font (e.g., Playfair Display or custom) | Google Fonts / self-hosted | Latin, Basic Indonesian (latin-ext covers id) |
| Body (UI, paragraphs) | Inter or Plus Jakarta Sans | Google Fonts / self-hosted | Latin, latin-ext |

### Loading Strategy

```html
<!-- Preload critical fonts -->
<link rel="preload" href="/fonts/display-latin.woff2" as="font" type="font/woff2" crossorigin />
<link rel="preload" href="/fonts/body-latin.woff2" as="font" type="font/woff2" crossorigin />
```

```css
@font-face {
  font-family: 'Display';
  src: url('/fonts/display-latin.woff2') format('woff2');
  font-display: swap;
  font-weight: 400 700;
}

@font-face {
  font-family: 'Body';
  src: url('/fonts/body-latin.woff2') format('woff2');
  font-display: swap;
  font-weight: 400 600;
}
```

**Rules:**

- `font-display: swap` — text is visible immediately with fallback font, then swaps (no invisible text).
- **Preload** only the two critical fonts (display + body). Additional weights loaded on demand.
- **Subset** to Latin + Latin Extended (covers Indonesian characters: é, è, ê, etc.).
- Self-hosted fonts (no Google Fonts CDN dependency) for privacy and performance.
- Total font budget: **< 80KB** for both fonts combined (woff2, gzip).

## 4. JS Strategy

### Code Splitting

| Bundle | Loaded On | Budget |
|--------|-----------|--------|
| Framework (Next.js + React) | Every page | ~90KB gzip |
| Critical page component | Route-specific | ~30KB gzip |
| Vendor libraries (e.g., Midtrans client) | Checkout only | ~25KB gzip |
| Utilities / helpers | Shared, tree-shaken | ~15KB gzip |
| **Total initial JS** | — | **< 200KB gzip** |

### Route Splitting

- Next.js automatic code splitting via dynamic `import()`.
- Heavy features (customization builder, checkout) are lazy-loaded:
  ```tsx
  const CustomizationBuilder = dynamic(() => import('@/components/customization/builder'), {
    loading: () => <BuilderSkeleton />,
  })
  ```
- **No heavy animation libraries** (Framer Motion, GSAP) in the initial bundle. If used at all, they load on interaction or on pages where animation is the primary experience.

### Client vs Server

| Concern | Execution | Reason |
|---------|-----------|--------|
| Page rendering | Server (RSC) | Fast first paint, SEO |
| Product data fetching | Server | No client waterfall |
| Analytics tracking | Client (afterInteractive) | Non-blocking |
| Customization sliders | Client (lazy) | Interactive, not needed for first paint |
| Checkout / payment | Client (lazy) | Only on `/checkout` |
| Animations | Client (lazy, below fold only) | Progressive enhancement |

### Prohibitions

- No `moment.js` (use native `Date` or `date-fns` with tree-shaking).
- No full lodash (use `lodash-es` individual functions or native equivalents).
- No client-side routing libraries beyond Next.js built-in.
- No React dev-mode warnings in production builds (`process.env.NODE_ENV` stripped).

## 5. Caching

| Layer | Strategy | TTL / Revalidation |
|-------|----------|-------------------|
| Cloudflare CDN edge | Static assets (images, fonts, JS, CSS) | `Cache-Control: public, max-age=31536000, immutable` (hashed filenames) |
| Cloudflare CDN edge | HTML pages | `s-maxage=3600, stale-while-revalidate=86400` |
| Next.js ISR | Product pages (`/aroma/:slug`) | `revalidate: 3600` (1 hour) |
| Next.js ISR | Category pages (`/parfum/:size`) | `revalidate: 3600` (1 hour) |
| Next.js ISR | Homepage (`/`) | `revalidate: 1800` (30 min) |
| Redis | Session data, rate limiting | TTL per use case (5-60 min) |
| Supabase | Database queries | Application-level cache via Redis for hot queries |
| Browser | Service worker (future) | Offline-first for catalog pages |

### ISR Invalidation

- On product update (price change, status toggle), trigger `revalidateTag('products')` or `revalidatePath('/aroma/[slug]')`.
- Webhook from admin panel triggers ISR purge.
- Fallback: stale content is served while revalidation runs (SWR pattern).

## 6. Low-End Device Strategy

### Graceful Motion Degradation

```css
/* Respect user preference */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}

/* Detect low-end via memory heuristic (client-side) */
@media (memory: low) {
  .hero-animation { display: none; }
}
```

**Rules:**

- Heavy parallax, particle effects, and continuous animations are **optional** — they degrade to static hero images on low-end devices.
- Check `navigator.deviceMemory` (Chrome) and `navigator.hardwareConcurrency` to detect constrained devices.
- Below a threshold (≤2GB RAM or ≤4 cores), disable:
  - Background video autoplay.
  - Canvas/WebGL effects.
  - Complex CSS animations (3D transforms, large-area blurs).
- Luxury aesthetic is maintained through typography, color, spacing, and product photography — **never** dependent on animation.

### Touch & Input

- All interactive elements have minimum 44×44px touch targets.
- No hover-dependent interactions on mobile.
- Slider inputs (customization) use native `<input type="range">` styling where possible for performance.

## 7. Measurement Workflow

### Lab Testing (Pre-Deploy)

| Tool | Environment | Purpose |
|------|-------------|---------|
| Lighthouse (Chrome DevTools) | Throttled: CPU 4× slowdown, network "Slow 4G" | Core Web Vitals simulation |
| Lighthouse CI | CI pipeline, Moto G emulation profile | Automated budget enforcement |
| WebPageTest | "Motorola Moto G Power — 4G" preset | Realistic device/network simulation |

**Frequency:** Run on every PR that touches layout, images, or JS bundles.

### Real User Monitoring (RUM)

| Source | Data | Refresh |
|--------|------|---------|
| Google CrUX (Chrome User Experience Report) | Field LCP, INP, CLS | Weekly |
| GA4 web-vitals (via `web-vitals` library) | Client-side CWV per session | Real-time |
| Sentry Performance | Transaction-level timing | Real-time |
| Supabase custom table | API response times logged by middleware | Daily |

**Process:**

1. Deploy to staging → run Lighthouse CI → confirm all budgets pass.
2. Deploy to production → monitor CrUX + GA4 web-vitals for 7 days.
3. If any metric regresses > 10%, investigate and fix before next deploy.
4. Monthly review: compare CrUX trends, identify slow pages, prioritize fixes.

## 8. Budget Enforcement in CI

### size-limit Configuration

```json
// .size-limit.json
[
  {
    "path": ".next/static/chunks/*.js",
    "limit": "200 KB",
    "gzip": true
  },
  {
    "path": ".next/static/chunks/framework-*.js",
    "limit": "90 KB",
    "gzip": true
  },
  {
    "path": "public/images/**/*.avif",
    "limit": "150 KB",
    "gzip": false
  }
]
```

### CI Pipeline Gates

```yaml
# .github/workflows/ci.yml (conceptual)
- name: Size check
  run: pnpm size-limit

- name: Lighthouse CI
  run: |
    lhci autorun \
      --config=lighthouserc.json \
      --collect.url=http://localhost:3000 \
      --collect.preset=moto-g-power-4g

- name: Image budget check
  run: node scripts/check-image-budgets.js --max-lcp-image=150KB
```

### Failure Policy

| Check | Failure Action |
|-------|----------------|
| JS bundle exceeds 200KB gzip | **Block merge** — must reduce before deploy |
| LCP image exceeds 150KB | **Block merge** — must optimize or compress |
| Lighthouse performance score < 80 | **Block merge** — investigate regression |
| CLS > 0.1 in Lighthouse | **Block merge** — fix layout shift |
| INP > 200ms in Lighthouse | **Warn** (non-blocking) — review in next sprint |

### Monitoring Over Time

- `size-limit` output is posted as a GitHub PR comment (via `github-action-size-limit`).
- Lighthouse scores are tracked in CI artifacts and compared against baseline.
- Budget regressions are visible in PR review before merge.
