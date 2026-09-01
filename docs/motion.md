# Motion Design — ATLASE

## 1. Motion Language Principles

1. **Communicate premium.** Every animation should reinforce the perception that ATLASE is a high-quality, artisan fragrance brand — not a generic ecommerce template.
2. **Don't animate everything.** Motion is a spotlight, not wallpaper. If everything moves, nothing stands out. Reserve animation for moments that need emphasis: a new element appearing, a price updating, a product being revealed.
3. **Guide the eye.** Motion directs attention. Use it to lead the customer through the customization flow, highlight the price, and confirm actions.
4. **Stay purposeful.** Every animation must answer: what does this communicate? If the answer is "nothing," remove it.
5. **Be respectful.** The customer's device, connection, and preferences come first. Never force motion on someone who has opted out or on hardware that can't handle it.

## 2. The 5-Level Hierarchy

| Level | Name | Purpose | Allowed Effects | When to Use |
|-------|------|---------|-----------------|-------------|
| L1 | Micro-interactions | Feedback on user actions | Button hover/press scale, toggle switch, checkbox check, input focus ring, tab indicator slide | Every interactive element — always active |
| L2 | Product Motion | Draw attention to the product | Subtle float animation on product cards, image zoom on hover, bottle scale on select | Product cards, product detail page, gallery |
| L3 | Scroll Reveals | Guide narrative flow as user scrolls | Elements fade-in and slide-up on scroll entry, staggered reveal for lists | Landing page sections, feature highlights, testimonials |
| L4 | Hero Cinematic | First impression, brand statement | Parallax background, text reveal with stagger, ambient particle/gradient movement | Landing page hero only — single use |
| L5 | Checkout Minimal | Keep checkout calm and trustworthy | Price ticker animation, step transition fade, success checkmark draw | Checkout flow only — restraint is key |

### Level Usage Rules

- L1 is always active — these are basic UI feedback and should never be disabled unless the user requests reduced motion.
- L2 is active on product surfaces — limited to 2–3 subtle effects per page.
- L3 is active on marketing/landing pages — disabled in checkout and cart.
- L4 is used **once** — the hero section on the landing page. No other section gets cinematic treatment.
- L5 is exclusive to checkout — keeps the experience calm and focused.

## 3. Duration + Easing Tokens

| Token | Duration | Easing | Use Case |
|-------|----------|--------|----------|
| `micro` | 150 ms | ease-out | Button hover/press, toggle, checkbox, focus ring |
| `product-float` | 3000 ms | ease-in-out (infinite) | Ambient float on product cards |
| `product-zoom` | 200 ms | ease-out | Image zoom on hover |
| `price-transition` | 300 ms | ease-out | Price ticker / price update animation |
| `modal-drawer` | 250 ms | cubic-bezier(0.16, 1, 0.3, 1) | CartDrawer open/close, modal enter/exit |
| `toast` | 200 ms | ease-out | Toast notification enter/exit |
| `scroll-reveal` | 600 ms | cubic-bezier(0.16, 1, 0.3, 1) | L3 scroll-triggered entrance |
| `hero-text` | 400 ms | cubic-bezier(0.16, 1, 0.3, 1) | L4 hero text stagger reveal |
| `step-transition` | 250 ms | ease-in-out | L5 checkout step fade |
| `success-check` | 500 ms | cubic-bezier(0.34, 1.56, 0.64, 1) | Order success checkmark draw |

### Easing Reference

- **ease-out**: Fast start, slow end. Good for entrances and appearing elements.
- **ease-in-out**: Symmetric. Good for ambient/continuous motion.
- **cubic-bezier(0.16, 1, 0.3, 1)**: Overshoot easing. Gives a premium, slightly bouncy feel to drawers and reveals.
- **cubic-bezier(0.34, 1.56, 0.64, 1)**: Strong overshoot. Reserved for celebratory moments (success checkmark).

## 4. Component Motion Specs

### Button Hover (L1)

- Scale: `1.02`
- Duration: `150ms` `ease-out`
- On press: scale to `0.98`, duration `100ms`
- Background color transition: `150ms ease-out`

### Magnetic Button (L1)

- On hover, the button subtly follows the cursor within a 10px radius.
- Creates a "magnetic" pull effect — premium, tactile feel.
- Spring physics: stiffness `300`, damping `20`.
- Disabled when `prefers-reduced-motion` is active.

### Product Card Hover (L2)

- Image zoom: `scale(1.05)` over `200ms ease-out`
- Subtle shadow elevation increase
- Optional ambient float: `translateY(-4px)` with `3000ms ease-in-out infinite` (alternate)
- Float is disabled on mobile and low-end devices.

### Hero Cinematic (L4)

- Background: subtle parallax scroll (background moves at `0.5x` scroll speed)
- Headline: staggered letter/word reveal, each `400ms cubic-bezier(0.16, 1, 0.3, 1)`, stagger `80ms`
- Subtitle: fade-in + slide-up, `600ms` delay after headline completes
- CTA button: fade-in, `400ms`, delay `200ms` after subtitle
- Entire sequence: total ~1.5s from page load
- Single use — no other section on the site gets this treatment.

### Price Ticker (L5)

- When "Menghitung harga..." text is shown: gentle pulsing opacity (`1500ms ease-in-out infinite`)
- When the authoritative price arrives: the number animates from `0` to the final value over `300ms ease-out`
- Thousands separator (dot) updates in sync
- If price changes (re-quote), the delta animates: old price fades out, new price fades in, `200ms` crossfade.

### Step Transitions (L5)

- Checkout steps (Pesanan → Alamat → Cara Pesan): outgoing step fades out (`150ms ease-in`), incoming step fades in (`250ms ease-out`)
- No slide/translate — keeps the checkout calm and avoids disorientation.
- Step indicator updates with a subtle width animation on the active step bar.

## 5. Reduced Motion Behavior

When the user's OS has `prefers-reduced-motion: reduce` enabled:

| Level | Behavior |
|-------|----------|
| L1 | Keep opacity transitions. Disable scale transforms on hover/press. Keep focus ring. |
| L2 | Disable float animation. Disable hover zoom. Product cards remain static. |
| L3 | Disable all scroll reveals. Elements appear instantly (opacity 1, no transform). |
| L4 | Disable parallax. Disable staggered text reveal. Hero loads with a simple fade-in (300ms). |
| L5 | Disable price ticker number animation. Price appears instantly. Keep step fade minimal (100ms opacity only). |

### Detection

```css
@media (prefers-reduced-motion: reduce) {
  /* Disable all non-essential motion */
}
```

```js
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
```

The app checks this setting on load and subscribes to changes. All motion components respect this flag.

## 6. Device / Performance Degradation

### Detection Strategy

- Check `navigator.hardwareConcurrency` (number of CPU cores).
- Check `navigator.deviceMemory` (RAM in GB, Chrome only).
- Check frame rate during initial load — if consistently below 30fps, downgrade.

### Degradation Rules

| Device Tier | L1 | L2 | L3 | L4 | L5 |
|-------------|----|----|----|----|----|
| High-end (8+ cores, 4+ GB RAM) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Mid-range (4–6 cores, 2–4 GB RAM) | ✅ | ✅ | ✅ (fewer elements) | ❌ | ✅ |
| Low-end (≤2 cores, <2 GB RAM) | ✅ | ❌ | ❌ | ❌ | ✅ |

- **Low-end devices**: L3 scroll reveals and L4 hero cinematic are disabled entirely. L2 product float is disabled. L1 micro-interactions and L5 checkout minimal are always active — they are lightweight and essential for UX feedback.
- **Frame rate monitoring**: If FPS drops below 30 during L3 scroll reveals on a mid-range device, dynamically disable L3 for the remainder of the session.

## 7. Implementation Notes

### Framer Motion

- All animations are implemented with **Framer Motion** (React).
- Use `motion.div`, `AnimatePresence`, and `useScroll` / `useTransform` for scroll-linked effects.
- Springs for magnetic button: `type: "spring", stiffness: 300, damping: 20`.
- Staggered children: `staggerChildren` in `variants` for hero text and list reveals.

### System Setting Respect

- Use `window.matchMedia('(prefers-reduced-motion: reduce)')` as the source of truth.
- Store the result in a React context or Zustand store so all components can access it without re-querying.
- Subscribe to changes — if the user toggles the setting while the page is open, respect it immediately.

### No WebGL Requirement

- All animations use CSS transforms, opacity, and Framer Motion's JavaScript animation engine.
- No WebGL, Three.js, or heavy animation libraries.
- This keeps the bundle small and ensures animations work on all modern browsers without GPU-specific requirements.
- The hero cinematic uses only CSS parallax (transform3d) and staggered opacity — no canvas or shader effects.
