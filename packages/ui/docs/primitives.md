# `@atlase/ui` — Core Primitives

React primitives for ATLASE (luxury fragrance e-commerce, mobile-first). All
utilities reference theme tokens declared in `src/styles/tokens.css` via the
Tailwind v4 `@theme` block — no literal hex/px values live in component source.

Typography uses the `atlase-text-*` utility classes (baked from the `@font-display`
Fraunces token and the `@font-sans` Inter token) so font-family and responsive
scale stay verbatim to `docs/design-system.md` §1.

## `cn`

Class merges `clsx(...)` (conditional + array inputs) flattened with
`tailwind-merge` so later/conflicting utilities win.

```ts
import { cn } from "@atlase/ui";
cn("px-2 px-4", "text-sm"); // -> "px-4 text-sm"
```

## `formatRupiah`

Pure integer-rupiah formatter. `Intl.NumberFormat("id-ID")` gives the `.`
thousands separator; `Rp` is prepended; decimals are never rendered; `0` →
`Rp0`. Negatives clamp to `0`.

- `formatRupiah(29000)` → `Rp29.000`
- `formatRupiah(89500)` → `Rp89.500`
- `formatRupiah(0)` → `Rp0`

Options:
- `prefix` — prepend `Mulai dari `.
- `useNbsp` — insert `U+00A0` before `Rp`.

## `Button`

`cva` component. Props: `intent` (`primary` | `secondary` | `outline` |
`ghost` | `destructive`), `size` (`sm` | `md` | `lg` | `xl`), `rounded`
(`default` | `full`), `asChild`, `loading`, plus native button attributes.

- All sizes enforce `min-h-11` (44px) for mobile touch safety.
- Padding uses `--space-{3|4|5|6}` horizontal and `--space-{2|3}` vertical.
- `loading` sets `aria-busy` (true), disables the field, and renders an
  `animate-spin` spinner (currentColor, `motion-reduce:animate-none`).
- Focus ring: `focus-visible:ring-2 ring-emerald ring-offset-ivory`.
- L1 press feedback: `active:scale-[0.98]`.

| Intent | Classes |
|--------|---------|
| primary | `bg-emerald text-black hover:bg-emerald-700` |
| secondary | `bg-black text-ivory hover:bg-black-600` |
| outline | `border border-emerald text-emerald bg-transparent hover:bg-emerald-50` |
| ghost | `text-text-primary hover:bg-ivory-50` |
| destructive | `bg-error text-ivory` |

## `Badge`

`cva` status tag. Props: `variant` (`success` | `error` | `warning` | `info` |
`neutral`). `rounded-full`, `text-xs` (≈12px, ≤13px), `min-h-7` (28px).

## `Pill`

`cva` metadata chip. Props: `variant` (`default` | `inverse` | `active`),
`interactive` (boolean), `pressed` (boolean → `aria-pressed`). Non-interactive
renders a `<span>`; interactive renders a `<button>` with `role="button"` and
the emerald focus ring.

## `Skeleton`

`cva` loading block. Props: `variant` (`text` | `rect` | `circle`). Background
`bg-ivory-200 dark:bg-black-400`, `animate-pulse` with `motion-reduce:animate-none`.

## `Container` / `Stack`

- `Container`: `mx-auto max-w-(--container-xl) px-4 sm:px-6`.
- `Stack`: `flex flex-col gap-(--space-{n})`; accepts `gap?: SpacingToken`
  (defaults to `space-4`).

## `SectionHeading`

Props: `eyebrow?`, `title` (required), `description?`, `titleSize?`
(`display-2` | `display-3`, default `display-2`). Eyebrow uses
`atlase-text-caption` (muted gray); title uses `atlase-text-display-2/3`
(Fraunces); description uses `atlase-text-body-lg`.

## `PriceDisplay`

Props: `price` (integer), `prefix?`, `useNbsp?`, `sub?`, `breakdown?`. Renders
the formatted price (`atlase-text-price`), an optional muted sub-line, and an
optional non-interactive breakdown (`<dl>`) of line items.

```tsx
<PriceDisplay price={89500} prefix useNbsp />
// → "Mulai dari  Rp89.500"
```

## Accessibility

- Interactive touch targets ≥ 44px (`Button`) / 28px (`Badge`, `Pill`).
- Focus-visible emerald ring on every interactive primitive.
- `prefers-reduced-motion` honored (`motion-reduce:animate-none`, pulse disabled).
- `aria-busy` on loading buttons, `aria-pressed` on interactive pills.

## Responsive

Mobile-first. Container pads `px-4` → `sm:px-6`; heading typography scales via
the `atlase-text-*` responsive rules (md/lg breakpoints from tokens).
