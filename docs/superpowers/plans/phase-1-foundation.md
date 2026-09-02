# Plan — Phase 1: Foundation + Design System

**Branch:** `feat/phase-1-foundation`
**Spec:** The ATLASE master product prompt (§1–§117) + the `/docs` directory committed in `4cd52dc` (binding detail lives in `docs/design-system.md`, `docs/architecture.md`, `docs/database.md`, `docs/performance.md`, `docs/roadmap.md`).

## Global Constraints (binding on every task)

1. **Monorepo tooling:** pnpm workspaces + Turborepo. Package scope prefix `@atlase/`. Package manager `pnpm@10`. Lockfile committed.
2. **TypeScript strict** on every package and app (`"strict": true`). Node ≥20.
3. **No code comments** anywhere in source files (config/docs files may explain; source code must not).
4. **Visible copy is Bahasa Indonesia sederhana.** No perfume jargon in UI strings.
5. **Money is integer rupiah** (`89000` = Rp89.000). No floats for money anywhere, even in foundations that touch pricing/domain types.
6. **Design tokens are the exact values from `docs/design-system.md` §1.** Black `#0A0A0A`, Deep Green `#0D6B4D`, Emerald `#19A974`, Ivory `#F5F2EA`, Muted Gray `#9A9A93`, plus the extended scale rows and semantic aliases. Emerald is accent-only (≤15% of a viewport, never a page background).
7. **Typography:** exactly 2 font families — `Fraunces` (display, serif) + `Inter` (sans). Self-hosted via `next/font` in the apps (build-time self-hosting). Fallbacks: `Georgia, "Times New Roman", serif` and `system-ui, -apple-system, sans-serif`.
8. **Tailwind v4 (CSS-first).** Design tokens are declared in one shared CSS entry (`@theme`) owned by `@atlase/ui`, consumed by apps. This overrides the doc's mention of `tailwind.config.ts` (spec §73 "centralized token system" is the binding authority; v4 `@theme` is the current mechanism). Token NAMES and VALUES stay identical to the doc.
9. **Mobile-first**, base styles target 360px–390px; breakpoints sm/md/lg/xl/2xl per doc (§1.7).
10. **Accessibility baseline:** touch targets ≥44px for interactive elements; `focus-visible` ring `ring-2 ring-emerald`; `prefers-reduced-motion` respected; no `outline-none` without a replacement.
11. Every package/app must have working `lint`, `typecheck`, and `build` (and `test` where tests are specified) runnable through the root `turbo` tasks. Commits per task are small, conventional (`feat:`, `fix:`, `chore:`, `docs:`).
12. **Per-component docs:** every component authored in this phase gets a short markdown doc entry following the template in `docs/design-system.md` §4 (Purpose, Variants, Props, States, Accessibility, Responsive, Motion, Usage example), written to the package's own `README.md` or `docs/` file.

## Task 1 — Root tooling & shared config

- Complete the root workspace: `package.json` (root `dev/build/lint/typecheck/test` scripts wired to turbo; engines), `turbo.json` (exists — verify tasks include `lint`, `typecheck`, `test`), `.npmrc` (`save-exact=true`, `auto-install-peers=true`), Prettier config + ignore, ESLint flat config at root for packages, `.editorconfig`.
- Create `packages/config` (`@atlase/config`):
  - `tsconfig.base.json` (strict, moduleResolvers bundler, target ES2022, module ESNext, jsx react-jsx, `verbatimModuleSyntax`, `isolatedModules`, source maps, exactOptionalPropertyTypes, `noUncheckedIndexedAccess`).
  - `tsconfig.nextjs.json` (extends base; `plugin: next`? no — just `"types": ["node"]` not needed; include `moduleResolution bundler`, `allowJs false`).
  - `tsconfig.react-library.json` (extends base; jsx react-jsx).
- Add `eslint-config` basics and `prettier` at root. Add a root `README.md` (short: what this repo is, pointer to `docs/`).
- Acceptance: `pnpm install` succeeds at repo root; `pnpm -r build`/`typecheck` are known-good no-ops for config-only packages; root `README.md` exists; `tsconfig.base.json` exists with strict flags listed above.

## Task 2 — Design token foundation in `@atlase/ui`

- Package `packages/ui` (`@atlase/ui`), `react-library` tsconfig, exports a CSS entry and a JS token module.
- `src/styles/tokens.css`: Tailwind v4 `@theme` block with every token from `docs/design-system.md` §1:
  - color tokens (core + extended + alias + success/error/warning), naming `--color-atlase-*`/`--atlase-*` per doc
  - spacing scale (as CSS vars), radius (radius-sm/md/lg/xl/full), shadows (shadow-sm…shadow-emerald-glow), motion durations + easings, z-index scale, container widths, breakpoints
  - Typography roles (`display-1..3`, heading, subheading, body-lg/sm, caption, price, button, label) as utility classes or `--text-*` theme vars with the exact px/line-height/weight from §1.3.
  - Emerald-usage guardrail documented in the file header (accent only).
- `src/tokens.ts`: exports `durations`, `eases`, `zIndex`, `colors` as typed const objects for non-CSS consumption (Framer Motion etc.). Values match tokens.css exactly.
- `src/index.ts` barrel exports `tokens`.
- `package.json` exports: `"."` (index.ts), `"./styles"` (tokens.css), `"./tailwind"` not needed for v4.
- Acceptance: `pnpm --filter @atlase/ui build` typechecks and (if a build script exists) succeeds; `tokens.css` contains the exact color hex values listed in the constraint; `pnpm --filter @atlase/ui test` runs (add any tiny vitest sanity test, e.g. tokens export shape).

## Task 3 — `@atlase/ui` core primitives

Add to `packages/ui` (React + cva + clsx + tailwind-merge + `tw-animate-css` not needed; keep deps minimal). Radix NOT required for these primitives.

Components (each documented per Global Constraint 12 inside `packages/ui/docs/primitives.md`):
1. `Button` — variants `primary` (solid emerald bg, black text), `secondary` (black bg on ivory / ivory text), `outline` (border, transparent), `ghost`, `destructive` (#C0392B); sizes `sm/md/lg/xl` ≥44px touch; loading state (spinner + disabled), disabled, focus-visible ring emerald; `asChild` optional; L1 press scale 0.98 via CSS `active:scale-[0.98]`.
2. `Badge` — solid/tinted variants, kinds `success|error|warning|info|neutral`, `rounded-full`, font ≤13px.
3. `Pill` — `bg-ivory-200 text-black` default, `bg-black text-ivory` inverse, `bg-emerald text-black` active variant; `rounded-full px-3 py-1`; optional interactive (button role) vs plain span; aria-pressed when interactive.
4. `PriceDisplay` — formats integer rupiah as `Rp89.000` (thousand separator, non-breaking space before Rp optional prop; prefix `Mulai dari ` optional), `price` typographic role, optional `sub` muted line, optional tooltip-free breakdown summary prop. Must be deterministic. Vitest: `formatRupiah(29000) === "Rp29.000"`, `89_500` → `Rp89.500`, `0` → `Rp0`.
5. `Skeleton` — `animate-pulse` ivory-200/gray blocks; prop `variant: 'text'|'rect'|'circle'`; honors reduced-motion (pulse only when motion allowed).
6. `Stack/Container` — layout primitives: `Container` (mx-auto, max-w per `container-xl` default, `px-4 sm:px-6`), `Stack` (vertical flex with gap via `space-*` tokens).
7. `SectionHeading` — eyebrow (subheading role, muted), title (display-2/display-3), optional description (body-lg); title uses Fraunces via utility class.

Implementation notes: single `.tsx` per component + `index.ts` barrel. All classes reference theme tokens (no literal hex/px in component files — values come from tokens.css). `cn` helper included. Accessibility wired (aria-* per component, focus-visible styles). Tests via vitest for `PriceDisplay` + `cn`.
- Acceptance: `pnpm --filter @atlase/ui test`, `typecheck`, `build` (turborepo `build` may just typecheck for a ui lib — use `tsc --noEmit`) all pass. Component doc file exists.

## Task 4 — `@atlase/domain` + `@atlase/types` foundations

- Package `packages/domain` (`@atlase/domain`): pure TS, no React.
  - Enums as `const` objects + derived union types (typed string unions, `as const`):
    - `OrderStatus` (DRAFT, PENDING_CONFIRMATION, CONFIRMED, PENDING_PAYMENT, PAID, PROCESSING, READY, SHIPPED, COMPLETED, CANCELLED, EXPIRED, REFUNDED, FAILED)
    - `PaymentStatus` (PENDING, PAID, FAILED, EXPIRED, REFUNDED)
    - `Channel` (WHATSAPP, DIRECT_PAYMENT, ADMIN)
    - `GoToMarket` not needed; add `PaymentMethod` (QRIS), `ConsentType` (MARKETING, DATA_PROCESSING, WHATSAPP), `MovementType` (PURCHASE, RESERVATION, SALE, CANCELLATION, ADJUSTMENT, RETURN), `FragranceVisibility` (ACTIVE, INACTIVE), `PricingVersionStatus` (DRAFT, PREVIEW, PUBLISHED, ACTIVE).
  - Order state machine: `ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]>` and `canTransition(from, to)` + `assertTransition(from, to)` matching `docs/database.md` §4 diagram exactly. Vitest covers: every valid edge in the diagram and ≥5 invalid edges (e.g. DRAFT→PAID throws, COMPLETED→SHIPPED throws).
- Package `packages/types` (`@atlase/types`): provisional entity interfaces matching `docs/database.md` §2 (fragrances, fragrance_pricing, bottles, packaging, products, orders, order_customizations, customers, payments, payment_transactions, pricing_versions). Money fields typed `number` (integer rupiah) with a `// integer rupiah` doc note. These are placeholders to be replaced by `supabase gen types` output later; mark each file header "provisional".
- Both packages: strict TS, `tsc --noEmit` build task, vitest for domain state machine. Barrels exported. `packages/types` no runtime dep.
- Acceptance: `pnpm --filter @atlase/domain test|typecheck`, `pnpm --filter @atlase/types typecheck` pass. State machine tests fully cover the diagram.

## Task 5 — `apps/web` storefront scaffold + landing foundation

- Next.js 15 (App Router, TypeScript, src dir) app in `apps/web` (`@atlase/web`), wired to `@atlase/ui`.
- Tailwind v4: the app's global CSS imports `@atlase/ui/styles` tokens plus small app-level `@theme` overrides (only if needed) and `@import "tailwindcss"`. No `tailwind.config.ts`.
- Fonts via `next/font`: `Fraunces` subset `latin` (display) + `Inter` subset `latin` (sans); both `display: 'swap'`, variables `--font-display` / `--font-sans`; applied in the root layout `className` combining var strings; Indonesia text uses latin subset (sufficient for Latin-ext chars, keep Latin).
- `app/layout.tsx`: metadata (title `ATLASE`, description Indonesian "Parfum premium yang bisa kamu sesuaikan dengan aroma dan budget kamu.", `og`), `lang="id"`, dark-first background `bg-black text-ivory`.
- `app/page.tsx` landing skeleton with the sections from `docs/ui.md` Home screen (12 sections): Navbar (placeholder, sticky glass-dark), Hero (L4-ready: full-bleed black, headline "PREMIUM FRAGRANCE. MADE PERSONAL." in Fraunces display-1, subline Indonesian "Parfum premium yang bisa kamu sesuaikan dengan aroma dan budget kamu.", price anchor "Mulai dari Rp29.000" via PriceDisplay, primary CTA "Pilih Aroma" Button), Starting Price strip, Featured Fragrances (ProductGrid placeholder with 3-4 static placeholder cards — no images yet, style-only skeletons or gradient blocks), How It Works (4 steps text), Build Your Perfume teaser, Price/Value band, Premium Showcase, Testimonials (placeholder), FAQ (Accordion-lite — simple details/summary themed), WhatsApp CTA, Footer.
  - Sections may be static content + styled shells (no live data). All copy in Bahasa Indonesia. Motion: only CSS transitions (no framer-motion dependency yet); `prefers-reduced-motion` respected via a global media query utility class.
- A tiny `lib/money.ts` in web: `formatRupiah(amount: number, opts?)` with `Intl.NumberFormat('id-ID')` producing `Rp29.000` format (deterministic), used by PriceDisplay via the ui package? No: PriceDisplay lives in ui; web re-uses it. (Skip duplication; web may re-export.)
- Acceptance: `pnpm --filter @atlase/web lint`, `typecheck`, and `build` (production build) succeed; page renders at `/` with hero copy exactly as above; no images referenced that don't exist; lighthouse-not-required yet.

## Task 6 — `apps/admin` admin shell scaffold

- Next.js 15 admin app in `apps/admin` (`@atlase/admin`), same token/font wiring pattern as web.
- `app/layout.tsx` (lang id, title "ATLASE Admin", background `bg-ivory text-black` — admin is light-mode).
- `app/login/page.tsx` placeholder: centered card, headline "Masuk ke Admin ATLASE", email + password inputs (Input primitives from ui, sourced via workspace `@atlase/ui`), Button "Masuk". Static only (no auth logic).
- `app/page.tsx` dashboard placeholder using a minimal sidebar shell: left nav with module list from `docs/admin.md` §1 (Dashboard, Orders, Products, Fragrances, Bottles, Packaging, Pricing, Pricing Rules, Inventory, Customers, Payments, WhatsApp Orders, Promotions, Analytics, Audit Logs, Settings) as inactive links (href="#"), main area shows heading "Dashboard" + a few stat placeholder Cards. Responsive: sidebar collapses to top bar on mobile.
- Default export routes so `pnpm --filter @atlase/admin build` passes.
- Acceptance: admin `lint`, `typecheck`, `build` pass; login page and dashboard shell render.

## Post-phase acceptance (whole phase)

- `pnpm install` from clean lockfile at repo root resolves.
- Root `turbo run lint typecheck test build` passes with no failures.
- `apps/web` production build succeeds and landing hero renders with the exact headline/subline/price copy.
- `apps/admin` production build succeeds.
- All new source files contain zero comments. All visible strings are Bahasa Indonesia.