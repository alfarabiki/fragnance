# ATLASE — Design System

> Modern Luxury design system for ATLASE — luxury-look fragrance ecommerce, Indonesian market, mobile-first, affordable prices.

**Visual Direction:** MODERN LUXURY. Black + Ivory dominates. Emerald is an ACCENT — not everywhere. Space + large typography + high-quality product imagery communicate luxury without pricey vibes.

---

## Table of Contents

1. [Design Tokens](#1-design-tokens)
2. [Component Inventory](#2-component-inventory)
3. [Component Principles](#3-component-principles)
4. [Component Documentation Template](#4-component-documentation-template)
5. [Accessibility](#5-accessibility)

---

## 1. Design Tokens

All tokens are centralized in a single source (`tailwind.config.ts` + CSS custom properties). Never hardcode values.

### 1.1 Colors

#### Core Palette

| Token | Value | Usage |
|-------|-------|-------|
| `--atlase-black` | `#0A0A0A` | Primary background, text on light, footer |
| `--atlase-deep-green` | `#0D6B4D` | Secondary surfaces, hover states, deep accents |
| `--atlase-emerald` | `#19A974` | **Accent only.** CTAs, active states, links, icons, success. Never a page background. |
| `--atlase-ivory` | `#F5F2EA` | Primary surface, light background, card base |
| `--atlase-muted-gray` | `#9A9A93` | Secondary text, placeholders, dividers, disabled |

#### Extended Scale (neutral ramps derived from black & ivory)

| Token | Value | Usage |
|-------|-------|-------|
| `--atlase-black-900` | `#0A0A0A` | Base black |
| `--atlase-black-600` | `#2A2A28` | Raised dark surface (dark cards) |
| `--atlase-black-400` | `#4A4A47` | Borders on dark, tertiary text on dark |
| `--atlase-ivory-50` | `#FBF9F4` | Raised light surface, hover on ivory |
| `--atlase-ivory-200` | `#EDE8DC` | Borders on light, dividers |
| `--atlase-emerald-50` | `#E9F7F2` | Emerald tint — emerald badge backgrounds |
| `--atlase-emerald-700` | `#0E7A55` | Emerald hover (darker) |
| `--atlase-gray-500` | `#9A9A93` | Muted gray base |
| `--atlase-success` | `#1E8E5A` | Success states, validation green |
| `--atlase-error` | `#C0392B` | Error states, destructive |
| `--atlase-warning` | `#B7791F` | Warning states, pending badges |

#### Alias Tokens

| Alias | Maps To |
|-------|---------|
| `--color-background` | `--atlase-black` (dark) / `--atlase-ivory` (light surfaces) |
| `--color-surface` | `--atlase-ivory` |
| `--color-surface-raised` | `--atlase-ivory-50` |
| `--color-surface-dark` | `--atlase-black-600` |
| `--color-text-primary` | `--atlase-black` (on light) / `--atlase-ivory` (on dark) |
| `--color-text-secondary` | `--atlase-muted-gray` |
| `--color-accent` | `--atlase-emerald` |
| `--color-border` | `--atlase-ivory-200` (light) / `--atlase-black-400` (dark) |

#### Emerald Usage Rule (Critical)

> Emerald appears on **≤ 15% of any viewport**. Apply to: primary CTA, active nav state, active pill, link hover, success feedback, small accent icons. Never: page backgrounds, large blocks, borders at scale.

### 1.2 Spacing

4px base scale.

| Token | Value | Usage |
|-------|-------|-------|
| `space-1` | 4px | Micro gaps, icon padding |
| `space-2` | 8px | Tight stacking, badge padding |
| `space-3` | 12px | Input padding, small gaps |
| `space-4` | 16px | Standard card padding, grid gap |
| `space-5` | 20px | Section padding (mobile) |
| `space-6` | 24px | Section padding (desktop), modal padding |
| `space-8` | 32px | Card group gaps |
| `space-10` | 40px | Large section gaps |
| `space-16` | 64px | Page/section separation |
| `space-24` | 96px | Hero padding, major rhythm |
| `space-32` | 128px | Landing page section spacing (desktop) |

**Rhythm rule:** Desktop sections get `py-24` (96px); mobile `py-16` (64px); hero uses `py-32` minimum.

### 1.3 Typography

**Font rules (strict):** maximum **2 font families** — 1 display + 1 sans. Indonesian char support required (ă, é, í, no issue with Latin Extended). Self-hosted for performance.

| Role | Font |
|------|------|
| Display | `Fraunces` (self-hosted, woff2) — serif display, luxury editorial character |
| Sans | `Inter` (self-hosted, woff2) — body, UI, support |

**Fallback:** `Georgia, "Times New Roman", serif` for display; `system-ui, -apple-system, sans-serif` for body.

#### Type Scale

| Token | Sizes (px) | Line-height | Weight | Role |
|-------|-----------|-------------|--------|------|
| `display-1` | 64 / 48 / 32 | 1.0 | 600 | Hero headline (desktop/tablet/mobile) |
| `display-2` | 48 / 40 / 28 | 1.05 | 600 | Section titles |
| `display-3` | 32 / 28 / 22 | 1.1 | 600 | Sub-page titles, collection headers |
| `heading-1` | 28 / 24 / 20 | 1.2 | 500 | Card titles, modal titles |
| `heading-2` | 20 / 18 / 17 | 1.3 | 500 | Sub-section titles, panel titles |
| `subheading` | 16 | 1.4 | 500 | Subheadings, eyebrow labels above titles |
| `body-lg` | 18 | 1.6 | 400 | Lead paragraphs, section descriptions |
| `body` | 16 | 1.6 | 400 | Default body |
| `body-sm` | 14 | 1.5 | 400 | Secondary text, table cells |
| `caption` | 12 | 1.4 | 400 | Helper text, timestamps, footnotes |
| `price` | 20 / 18 / 16 | 1.2 | 600 | Price display (inherits sans) |
| `button` | 16 | 1.0 | 600 | Button labels |
| `label` | 13 | 1.3 | 500 | Form labels, small metadata |

**Display font (`Fraunces`) is reserved for:**
- Hero headlines
- Section titles that announce a "collection" or "editorial" moment
- Order success headline

**Accessibility:** body ≥ 16px default; caption ≥ 12px but never for critical info; Indonesian copy keeps natural spacing (`tracking-normal` for body, `tracking-tight` display).

### 1.4 Radius

| Token | Value | Usage |
|-------|-------|-------|
| `radius-none` | 0 | Editorial cards, hero images, "luxury crop" moments |
| `radius-sm` | 6px | Inputs, small elements |
| `radius-md` | 10px | Cards, buttons, small boxes |
| `radius-lg` | 16px | Modals, bottom sheets, large cards |
| `radius-xl` | 24px | Hero imagery container (mobile sheets) |
| `radius-full` | 9999px | Pills, badges, avatars, round buttons |

> Luxury signal: keep most containers `radius-none` or `radius-sm`. Reserve large radius for interactive surfaces (modals, sheets) and pills.

### 1.5 Shadows

| Token | Value |
|-------|-------|
| `shadow-sm` | `0 1px 2px rgba(10,10,10,0.06)` |
| `shadow-md` | `0 4px 12px -2px rgba(10,10,10,0.10)` |
| `shadow-lg` | `0 12px 32px -8px rgba(10,10,10,0.16)` |
| `shadow-xl` | `0 24px 64px -16px rgba(10,10,10,0.24)` |
| `shadow-emerald-glow` | `0 0 0 1px rgba(25,169,116,0.35), 0 8px 24px -6px rgba(25,169,116,0.35)` |

**Dark surface shadow:** lower opacity, use `rgba(0,0,0,0.5)` variants on black backgrounds.

### 1.6 Motion

#### Durations

| Token | ms | Usage |
|-------|-----|-------|
| `duration-fast` | 150 | Micro-interactions, button states, hover |
| `duration-base` | 300 | Standard transitions, accordion, pill swaps |
| `duration-slow` | 500 | Panel/sheet enter, section reveals |
| `duration-hero` | 1200 | Hero cinematic (Ken Burns, large fades) |

#### Easing
- **Default UI spring:** `cubic-bezier(0.22, 1, 0.36, 1)` (easeOutExpo-like)
- **Subtle/reduce-safe:** `cubic-bezier(0.4, 0, 0.2, 1)`
- **Hero cinematic:** `cubic-bezier(0.16, 1, 0.3, 1)` (slow, luxurious settle)
- **Enter/exit (Framer Motion spring):** `{ type: "spring", stiffness: 260, damping: 26 }`

#### Motion Hierarchy

| Level | Scope | Examples | Performance |
|-------|-------|----------|-------------|
| **L1** | Micro-interactions | Button press (scale 0.98), focus ring fade, switch toggle, accordion | Transform/opacity only |
| **L2** | Product float/zoom | Card hover float +4px, image zoom on hover, gallery swipe | GPU transforms |
| **L3** | Scroll reveals | Section fade-up + 24px translate, staggered grids | `IntersectionObserver`, once |
| **L4** | Hero cinematic | Ken Burns, slow parallax, staggered headline reveal | Limit to hero only |
| **L5** | Checkout minimal | Payment screen countdown, success checkmark draw-on | Near-zero motion |

**Reduced motion (`prefers-reduced-motion`):** everything collapses to cross-fade at 200ms or static. L4 becomes a single static fade. L2 hover transforms disabled.

**Weak device degradation:** No WebGL requirement anywhere. Heavy animation (L3/L4) auto-disabled when device memory/CPU weak or `prefers-reduced-motion`. Luxury remains — animation is enhancement.

### 1.7 Breakpoints

Mobile-first. Some sections **re-compose**, not just shrink.

| Name | Min-width | Grid | Layout notes |
|------|-----------|------|--------------|
| `sm` | 640px | 2-col | Tablet start, some layout change |
| `md` | 768px | 2-col | 2-column split sections begin |
| `lg` | 1024px | 3-col | Desktop: nav links visible, 3–4 col grids |
| `xl` | 1280px | 4-col | Large desktop: full container width |
| `2xl` | 1536px | 4-col | Extra-wide, typography scales up |

### 1.8 Z-Index (stacking order)

| Token | Value | Element |
|-------|-------|---------|
| `z-base` | 0 | Default content |
| `z-sticky` | 100 | Sticky navbar |
| `z-overlay` | 200 | Fixed overlays, backdrop |
| `z-dropdown` | 300 | Dropdowns, popovers, tooltips |
| `z-sheet` | 400 | Drawers, bottom sheets |
| `z-modal` | 500 | Modals |
| `z-toast` | 600 | Toasts, snackbars |
| `z-fab` | 150 | Floating WhatsApp button (below overlay) |

### 1.9 Container Widths

| Token | Value | Usage |
|-------|-------|-------|
| `container-sm` | 480px | Forms, checkout summary, single-column modals |
| `container-md` | 720px | Content blocks, FAQ, testimonials |
| `container-lg` | 1080px | Product grids, section content |
| `container-xl` | 1280px | Default page max-width |
| `container-full` | 100% | Hero, editorial full-bleed sections |

**Rule:** content centers with `mx-auto`, horizontal padding `px-4` mobile / `px-6` desktop.

---

## 2. Component Inventory

Every component is a Tailwind + shadcn/ui + Radix primitive extended with our tokens. Custom additions are marked ⭐.

### shadcn/ui Base (installed as-is, themed)

| shadcn component | We use for |
|------------------|------------|
| `Button` | Buttons (themed) |
| `Badge` | Status, informational tags |
| `Card` | Card containers, product cards base |
| `Input` | Text fields |
| `Textarea` | Multi-line fields |
| `Select` | Native-feel select (themed) |
| `DropdownMenu` | Menus, account menu |
| `Combobox` | Searchable selects |
| `Slider` | Intensity / price sliders |
| `Checkbox` | Form options |
| `Switch` | Toggles (admin) |
| `RadioGroup` | Exclusive choices |
| `Tabs` | Product detail notes, admin tabs |
| `Accordion` | FAQ, order summary |
| `Tooltip` | Help, icons |
| `Popover` | Date pickers, custom dropdowns |
| `Dialog` | Modals |
| `Sheet` | Cart drawer, bottom sheets, admin panels |
| `Toast` | Feedback |
| `Skeleton` | Loading states |
| `Breadcrumb` | Navigation trail |
| `Separator` | Dividers |

### Custom Components ⭐

| Component | Purpose |
|-----------|---------|
| `Navbar` | Sticky glass-dark nav, hamburger mobile, cart badge, mini-search |
| `Hero` | L4 cinematic editorial hero; variant: `compact` |
| `MagneticButton` | Desktop hover-follow CTA (Framer Motion) |
| `ProductCard` | Full product presentation card |
| `ProductGrid` | Responsive auto-grid wrapper |
| `PriceDisplay` | Price with `Mulai dari` prefix + optional breakdown tooltip |
| `Pill` | Compact metadata tag / filter choice |
| `QuantitySelector` | − qty + stepper |
| `BottomSheet` | Mobile-native modal alternative |
| `CartDrawer` | Slide-in cart preview |
| `PhoneInput` | Indonesian phone field (prefix +62, auto-format) |
| `AddressForm` | Composite address form w/ validation |
| `Stepper` | Multi-step indicator (4-step builder) |
| `EmptyState` | Empty collection/result states |
| `LoadingState` | Skeleton-block loading states |
| `ErrorState` | Error banner + retry |
| `DataTable` | Admin table (sort, filter, paginate) |
| `Chart` | Admin dashboard charts (Recharts) |
| `Timeline` | Admin order log |
| `QrisCode` | QRIS payment display + countdown |
| `Countdown` | Payment timer |
| `StarRating` | Rating display + interactive |
| `WheelPicker` | Scent selection wheel (customization step 2) ⭐ core differentiator |
| `NotePyramid` | Top/heart/base note pyramid visualization |

### Component Map by Screen

| Screen | Components |
|--------|------------|
| Home | Navbar, Hero, PriceDisplay, Badge, Pill, ProductGrid, ProductCard, Stepper(display), Button/MagneticButton, Accordion, CartDrawer, Toast |
| Collection | Breadcrumb, Pill, Dropdown, Input, ProductGrid, ProductCard, Skeleton, EmptyState, BottomSheet |
| Product Detail | Gallery, StarRating, Badge, Pill, PriceDisplay, NotePyramid, Button, ProductCard, Toast |
| Buat Parfum | Stepper, WheelPicker, Pill, Slider, Combobox, RadioGroup, PriceDisplay, Button |
| Cart | CartDrawer(panel), QuantitySelector, PriceDisplay, ProductCard, Button, Skeleton |
| Address | AddressForm, PhoneInput, Input, Textarea, Combobox, RadioGroup, Button |
| Checkout | Card, RadioGroup, Input, PriceDisplay, Button, Separator |
| QRIS/Payment | QrisCode, Countdown, PriceDisplay, Button, Toast |
| Order Success | Button, Badge, Card, Stateless success animation |
| WhatsApp Handoff | Card, Button, Static message preview |
| Admin | Sidebar, DataTable, Select, Switch, Badge, Dialog, Toast, Chart, Input, Slider, Counter |

---

## 3. Component Principles

### 3.1 Pill / Badge Discipline

- **Pills & badges exist for metadata ONLY:** `POPULAR`, `NEW`, `PREMIUM`, `BEST SELLER`, `MULAI Rp29.000`, category filters, status badges (admin).
- **Sparingly:** never more than 2 pills per card, never a pill that repeats card copy already visible.
- Style: `rounded-full`, `bg-emerald-50` tint / `text-emerald-700` for active, or inverse (`bg-black` / `text-ivory`) for editorial placements. Pill backgrounds are neutral (`ivory-200`), emerald reserved for active/strongest signal.
- Pills are non-interactive by default except filter pills (which behave like RadioGroup).

### 3.2 Dropdown / Select / Combobox

- **Mobile-friendliness:** native `select` on coarse pointers for simple lists; `Combobox` with search for > 6 options.
- **Keyboard:** full keyboard nav (↑↓, Enter, Esc, type-ahead), focus trap in popover.
- **Searchable** when options > 6 (Indonesian city/province/note lists).
- **Accessible:** `aria-expanded`, `role="listbox"`, `aria-selected` on options, visible focus ring, label linked via `htmlFor`.
- Trigger displays selected value; never placeholder text as value.

### 3.3 Text Inputs — Always Labeled

- **Always visible:** top label (`Label` component) — never placeholder-as-label.
- **Always have:** label + placeholder (optional when self-evident) + helper text (contextual) + validation feedback.
- **States visible:** `default`, `focus`, `error` (error border + error message + `aria-invalid`), `success` (optional green check only when passing, e.g. promo code), `disabled` (reduced opacity, cursor not-allowed).
- **Feedback timing:** validate on blur or debounced 500ms on change; never block user with "required" before typing.

---

## 4. Component Documentation Template

Every component follows this section structure. Example below using **ProductCard**.

### Example: `ProductCard`

#### Purpose
Primary product presentation across Home, Collection, Related, Cart upsell. Must sell the fragrance at a glance while feeling premium.

#### Variants
| Variant | When used | Differences |
|---------|-----------|-------------|
| `default` | Grid cards (collection/home) | Image top, info below |
| `editorial` | Premium showcase (home) | Large image, overlay text, minimal chrome |
| `compact` | Cart upsell, related row | Smaller paddings, no badge slot |
| `horizontal` | Cart items | Thumb + info inline, quantity adjacent |

#### Props
```ts
interface ProductCardProps {
  product: ShopProduct;
  variant?: 'default' | 'editorial' | 'compact' | 'horizontal';
  priority?: boolean;            // LCP image hint for first cards
  onSelect?: (id: string) => void;
  badge?: ProductBadge;          // 'POPULAR' | 'NEW' | 'PREMIUM' | 'BEST SELLER' | 'MULAI Rp29.000' | undefined
  showPrice?: boolean;           // default true
  className?: string;
}
```

#### States
| State | Behavior |
|-------|----------|
| Loading | Skeleton: image ratio `aspect-[4/5]` + 2 text lines |
| Error (image) | Gray `ivory-200` block + perfume icon fallback |
| Success | Full render, lazy images, price formatted |
| Hover (pointer) | Float +4px, shadow `lg`, image scale 1.04 |

#### Accessibility
- Card is a single `<a>` (with stretched-link pattern) → keyboard reachable, one tab stop.
- Image `alt` = product name; empty alt if image is decorative with name elsewhere.
- Badge text read by SR naturally in reading order.
- Minimum touch target 44×44 for nested interactive elements.

#### Responsive
- Grid wrapper controls columns; card itself adapts: `compact` width ~260px, `horizontal` full-width row with `flex max-h-24`.
- Editorial variant: full-bleed `aspect-[4/3]` mobile → `aspect-[16/10]` desktop, text overlay bottom-left.

#### Motion
- L2: hover float — `translateY(-4px)` 300ms `cubic-bezier(0.22,1,0.36,1)`, shadow transition; disabled on reduced motion.
- L3: appear on scroll — fade-up 24px stagger by grid index (cap 0.6s delay).
- Press: scale 0.98 (L1).

#### Usage Example
```tsx
<ProductGrid cols="2 lg:4">
  {featured.map((p, i) => (
    <ProductCard
      key={p.id}
      product={p}
      badge={p.badge}
      priority={i < 2}
      onSelect={() => router.push(`/produk/${p.slug}`)}
    />
  ))}
</ProductGrid>
```

---

### Component Documentation Index (each component documents as above)

| Component | Key specs |
|-----------|-----------|
| **Navbar** | Sticky, `bg-black/85 backdrop-blur` after 40px scroll; links Center (desktop), cart icon + badge `z-sticky`; mobile hamburger → Sheet |
| **Hero** | Full-bleed; default = image bg + overlay gradient `linear-gradient(180deg, transparent 40%, rgba(10,10,10,0.7))`; caption left; CTA `MagneticButton` |
| **MagneticButton** | Desktop only; cursor-follow translate (max 6px); kill on reduced-motion/weak-device → static button |
| **PriceDisplay** | `Mulai dari Rp29.000` format; `Rp` non-breaking; token `price` scale; optional `tooltip` breakdown |
| **Badge** | Solid tinted; types: success/error/warning/info/neutral; `rounded-full`; max font `label` 13px |
| **Pill** | `rounded-full px-3 py-1`, `bg-ivory-200 text-black` default, `bg-emerald text-black` (white text variant) active; used in filters & metadata |
| **Tooltip** | Radix Tooltip; appears on hover descriptor, `Enter`-shows on keyboard; delay 300ms; `z-dropdown` |
| **Select/Combobox** | Native select mobile; Combobox > 6 options; searchable, keyboard nav, `aria-selected` |
| **Slider** | Focusable thumb `focus-visible:ring-2 ring-emerald`; label + value readout; step sizes documented per use |
| **QuantitySelector** | Buttons − / count / +; min 1 max 20; `aria-label="Kurangi jumlah"`; disable − at 1 |
| **Modal** | Radix Dialog; scale-in 300ms + backdrop fade; `Esc` closes; focus returns to trigger; body scroll locked; `z-modal` |
| **BottomSheet** | Mobile modal; slides from bottom `600ms` spring; drag-down-to-close ≥ 40px; header grabber; `z-sheet` |
| **CartDrawer** | Right-side Sheet 360px; shows items + total + "Lanjut Pesan"; exit to cart; `z-sheet` |
| **Toast** | `z-toast` bottom-center mobile/bottom-right desktop; auto 4s; 3–5 massions; aria-live polite; success/error/info/warning |
| **Input** | Label always visible; states default/focus/error/success/disabled; helper under field; `aria-invalid` |
| **Textarea** | Same as Input; min 3 rows; char counter on demand |
| **PhoneInput** | `+62` prefix; number-only; strips leading `0` → `8xx`; max 15 digits; validation message Indonesian |
| **AddressForm** | Composite; fields Name, Phone, Address, City, Province, Postal, Note; per-field states; submit disabled until valid |
| **Stepper** | 4 steps builder; icons circle; current = emerald fill, complete = check, future = muted; connective line animates |
| **Accordion** | Radix Accordion; single-open for FAQ; chevron rotate; height animate 300ms |
| **Tabs** | Radix Tabs; underline indicator animates; keyboard ↓/←/→ nav |
| **RadioGroup** | Radix; custom dot; `aria-checked`; 44px hit area |
| **Checkbox** | Radix; emerald when checked; label clickable |
| **Switch** | Radix switch; admin toggles; `aria-checked`; state read aloud |
| **Breadcrumb** | Home > Koleksi > [Item]; `role="navigation"` + current page `aria-current="page"` |
| **Skeleton** | `animate-pulse` ivory-200 blocks, matching real component shape |
| **EmptyState** | Icon + title + body + CTA; used across collection/cart/search/admin |
| **LoadingState** | Block skeleton composition per screen (grid/table/form variants) |
| **ErrorState** | Error copy + retry Button; logged via analytics; never shows stack traces |
| **DataTable** | Admin sortable/filterable/paginated; row actions in kebab menu; responsive card-mode mobile |
| **WheelPicker** | Scent selection; radial layout; central glow follows selection; L2 rotate; accessible list fallback |

---

## 5. Accessibility

### 5.1 Contrast (WCAG 2.2 AA minimum)

| Pairing | Ratio check | Verdict |
|---------|-------------|---------|
| `#F5F2EA` text on `#0A0A0A` bg | ~16.5:1 | Pass |
| `#0A0A0A` text on `#F5F2EA` bg | ~16.5:1 | Pass |
| `#19A974` on `#0A0A0A` | ~6.4:1 | Pass (large text & UI) |
| `#0A0A0A` on `#19A974` (CTA text) | ~6.4:1 | Pass |
| `#9A9A93` (muted gray) text | ~3.1:1 | **Fail AA for body** → muted gray is **secondary text only** (≥ 14px bold or ≥ 18px), never body copy; on dark use `#B5B5AE` variant |
| `#EDE8DC` (borders/divider) | decorative | N/A (not text) |

> Enforcement: lint color usage; `text-secondary` component used only where WCAG allows; error/success messages use `#C0392B` / `#1E8E5A` (both ≥ 4.5:1 on ivory).

### 5.2 Keyboard Navigation

- All interactive elements reachable via Tab in logical DOM order.
- Radix primitives provide ARIA roles & arrow-key navigation (Select, Combobox, Dialog, Tabs, Accordion, Tooltip).
- Visible focus: `focus-visible` ring `ring-2 ring-emerald` (3px offset), never `outline-none` without replacement.
- Dialog/Sheet: focus trap, `Esc` to close, focus restoration to trigger.

### 5.3 Screen Readers

- Every input: `<Label>` + `htmlFor` + optional `aria-describedby` to helper/error ids.
- Form errors: `role="alert"` or linked `aria-describedby`, announced on appearance.
- Icons: `aria-hidden="true"`; icon-only buttons get `aria-label` (Bahasa Indonesia).
- Images: product images `alt` = product name; decorative images `alt=""`.
- Status changes (toast, payment state): `aria-live="polite"`.
- Landmarks: `<nav>`, `<main>`, `<header>`, `<footer>` throughout.

### 5.4 Reduced Motion

- `prefers-reduced-motion: reduce` → all custom motion resolves to 200ms cross-fade or none.
- Framer Motion: single `MotionConfig reducedMotion="user"`.
- L2 hover transforms, L4 Ken Burns, draw-on checkmark all disabled.
- CRITICAL: reduced motion never removes content or state — only animation.

### 5.5 Weak Device Degradation

- Detect via `navigator.hardwareConcurrency`, `deviceMemory`, and WebGL absence.
- Disable L3/L4; keep L1, static luxury typography + imagery.
- Images: `loading="lazy"` everywhere except LCP (hero, first grid items use `priority`); `width`/`height` set to prevent CLS.

### 5.6 Touch Targets

- Minimum 44×44 CSS px for all interactive targets (buttons, pills, steppers, selectors).
- Pills/badges (informational only) exempt but still ≥ 28px visual.
- Bottom-sheet drag handle ≥ 32px wide.

### 5.7 Form Interactions

- Never placeholder-as-label (enforced in code review).
- Validation on blur; error copy in Bahasa Indonesia, specific and actionable:
  - "Nomor HP tidak valid. Gunakan format 08xx."
  - "Kolom ini wajib diisi."
  - "Kode pos harus 5 digit."
- Success feedback only for actions that warrant it (promo code, save, add-to-cart), never on every keystroke.