# Task 2 — Report: `@atlase/ui` design token foundation

**Status:** DONE

## What was created/changed

- `packages/ui/package.json` — new `@atlase/ui` package (private, version `0.0.0`). Exports: `.` → `./src/index.ts`, `./styles` → `./src/styles/tokens.css`, `./tokens` → `./src/tokens.ts`. Scripts `build`/`lint`/`typecheck` (`tsc --noEmit -p .`) and `test` (`vitest run`). DevDeps pinned exact (save-exact): `tailwindcss@4.3.3`, `vitest@3.2.7`, `typescript@7.0.2`, `@types/node@26.4.0`.
- `packages/ui/tsconfig.json` — extends `@atlase/config`'s react-library base.
- `packages/ui/src/styles/tokens.css` — Tailwind v4 `@theme` entry declaring every §1 token verbatim (colors, spacing, typography vars + responsive utilities, radius, shadows, motion, breakpoints, z-index, containers) plus `.atlase-container`, `.atlase-text-*` utilities, `.focus-ring`, and a `prefers-reduced-motion` guardrail. Header doc includes the Emerald accent-only guardrail (≤15% of viewport, never a page background).
- `packages/ui/src/tokens.ts` — typed-const exports: `colors`, `spacing`, `durations`, `eases`, `radius`, `zIndex`, `breakpoints`, `containers` + type aliases. Values match `tokens.css` exactly (uppercase hex).
- `packages/ui/src/index.ts` — barrel `export * from './tokens'`.
- `packages/ui/src/tokens.test.ts` — vitest sanity tests asserting core color hexes, durations, z-index, containers, breakpoints.
- `pnpm-lock.yaml` — updated by install (new workspace deps).

## Verification results (exit-code evidence)

All run from `D:\Code\Personal\Fragnance\atlase` with `pnpm v10.33.0`, Node v24.

```
$ pnpm --filter @atlase/ui typecheck
> tsc --noEmit -p .
<no output>   TC_EXIT=0

$ pnpm --filter @atlase/ui build
> tsc --noEmit -p .
BUILD_EXIT=0

$ pnpm --filter @atlase/ui test
 RUN  v3.2.7
  ✓ src/tokens.test.ts  5 tests
  Test Files  1 passed (1)
  Tests       5 passed (5)
TEST_EXIT=0

$ rg -n "#0A0A0A|#0D6B4D|#19A974|#F5F2EA|#9A9A93|#1E8E5A|#C0392B|#B7791F" packages/ui/src/styles/tokens.css
→ 10 match lines confirmed (all 8 distinct acceptance hex values present, uppercase, verbatim from docs/design-system.md §1).
```

Spot-check tokens.ts vs tokens.css consistency:
- `colors.black === '#0A0A0A'` ✓ — CSS `--color-black: #0A0A0A` ✓
- `durations.fast === 150` ✓ — CSS `--duration-fast: 150ms` ✓
- `containers.xl === 1280` ✓ — CSS `--container-xl: 1280px` ✓
- `zIndex.modal === 500` ✓ — CSS `--z-modal: 500` ✓

## Interpretation notes (design-system.md §1)

- **CSS mechanism:** Used Tailwind v4 `@theme` in `:root, :host { @theme { ... } }` per global constraints, instead of the doc's mention of `tailwind.config.ts`. Token *names* and *values* are kept identical to the doc.
- **Color naming:** Canonical palette names follow §1 verbatim (`--atlase-black`, `--atlase-emerald`, …) holding the literal hex values; `--color-*` aliases map `var(--atlase-*)` to preserve Tailwind v4 utility generation (`bg-black`, `text-emerald`, …). The doc's semantic aliases (`--color-background`, `--color-surface`, `--color-accent`, `--color-border`, …) also resolve to `var(--atlase-*)` per the §1 alias table. All core, extended, and status colors from both tables are included. (Reconciled in Fix Report Round 1.)
- **Typography:** `--font-display` (Fraunces stack with `Georgia, "Times New Roman", serif` fallback) and `--font-sans` (Inter stack with `system-ui, -apple-system, sans-serif` fallback) defined. Font *files* load in apps (Task 5/6), not here. Base (mobile) type-scale sizes/lh/weight encoded as CSS vars; the desktop/tablet breakpoint sizes are applied via `@media` scale-up utilities (display-1 32→48→64, d2 28→40→48, d3 22→28→32, h1 20→24→28, h2 17→18→20, price 16→18→20 per §1.3).
- **Spacing:** doc lists `space-1..10, 16, 24, 32` (note: `space-7/9/11..15` omitted from the doc scale). Mirrors the doc exactly rather than filling gaps.
- **Containers:** doc §1.9 also lists `container-full: 100%`; included it in `tokens.ts` as `containers.full = "100%"` and as `--container-full: 100%` in `tokens.css` (added in Fix Report Round 1).
- **Z-index:** `--z-fab` placed at 150 per doc §1.8 (below overlay 200).

## Concerns

1. **`package.json` `"types"` field omitted.** The brief specified `"types": { "tsconfig": "../../config/tsconfig.react-library.json" }`. This is an object value for a field that TypeScript treats as a type-entry path; tsc tried to resolve it relative to the package dir (`../../config/...` → `atlase/config/...`), a nonexistent root-level path, producing `Cannot read file .../config/tsconfig.react-library.json`. With the field in place typecheck/build failed. Dropping it (a proper local `tsconfig.json` already governs compilation) let typecheck pass. Documented as an interpretation, not a deviation from token values.
2. **tsconfig `extends` path corrected.** The brief's "Current repo state" note gives `packages/config/tsconfig.react-library.json` but also instructs to extend `"../../config/tsconfig.react-library.json"`, which from `packages/ui/tsconfig.json` resolves to root `atlase/config/` (nonexistent). Used `"../config/tsconfig.react-library.json"` → `atlase/packages/config/...` (the actual location). Same intent, correct path.
3. **`typescript` added to devDeps.** Not listed in the brief's devDep hint (`tailwindcss`, `vitest`), but `tsc`/`build`/`typecheck` scripts require it; without it `tsc` was not on the resolved `PATH` (`'tsc' is not recognized`). Added `typescript@latest` → resolved `7.0.2` (TS 7 native preview on Node 20+, installed here on Node v24); pinned exact per save-exact.
4. **`@types/node` added.** Required because vitest/vite's ambient type declarations reference `node:*` modules and `NodeJS`/`Buffer` globals; without `@types/node` typecheck emitted ~60 `Cannot find name 'Buffer'/'NodeJS'/'setImmediate'` errors from `node_modules`. Added and constrained via `"types": ["node"]` to also avoid an unrelated `@types/chai` duplicate-identifier (`containSubset`) and to prevent pulling unrelated ambient types. This does not affect token values.
5. **`@types/node` version is `26.4.0` on Node 24.** Resolved automatically (latest @types/node tracks Node 26 stubs). Acceptable for typecheck; no runtime impact (the package ships no JS runtime).
6. **CRLF / line-ending warnings.** Git on this Windows machine warned LF→CRLF conversion for the committed source; files were authored LF. No content change, cosmetic only.
7. **No code comments in `.ts` source.** Honored; only `tokens.css` carries a purposeful header doc (allowed by constraints). `docs/`, `.superpowers/`, and `tests/` were not modified. `docs/superpowers/` appeared as an untracked pre-existing directory (created before this task) and was left untouched/uncommitted.

## Fix Report (Round 1)

Review-package BASE: `0307945` (`test: add @atlase/ui design token sanity tests`). All fixes applied to `packages/ui` only.

### What changed

**`src/styles/tokens.css`**
- Palette vars renamed to canonical §1 `--atlase-*` names (`--atlase-black`, `--atlase-deep-green`, `--atlase-emerald`, `--atlase-ivory`, `--atlase-muted-gray`, plus extended neutral ramp `--atlase-black-900/600/400`, `--atlase-ivory-50/200`, `--atlase-emerald-50/700`, `--atlase-gray-500`, and status `--atlase-success` / `--atlase-error` / `--atlase-warning`). Each holds the verbatim hex from §1 (no value changed).
- Added `--color-*` aliases mapping `var(--atlase-*)` for every palette token so Tailwind utility generation (`bg-black`, `text-emerald`, …) keeps working.
- Semantic aliases (`--color-background`, `--color-surface`, `--color-surface-raised`, `--color-surface-dark`, `--color-text-primary`, `--color-text-secondary`, `--color-accent`, `--color-border`) now resolve to `var(--atlase-*)` per the §1 alias table (was `var(--color-*)`).
- Added `--container-full: 100%` to the `@theme` block.
- `.atlase-text-heading-1` font-family changed `var(--font-display)` → `var(--font-sans)` (Fraunces reserved for hero/section-success per §1.3); heading-2 and subheading remain `var(--font-sans)` (unchanged).
- Removed all inline section-divider comments inside and after `@theme` (`/* ---- Core palette ---- */`, `/* ---- Typography utilities … ---- */`, etc.). Kept only the purposeful file header doc. No comments added elsewhere.

**`src/tokens.ts`**
- Added `spring: { type: "spring", stiffness: 260, damping: 26 }` as the 4th entry in `eases` (per §1.6 Framer Motion spring). No other token changed; all hex/numeric values remain verbatim.

### Reviewer-item reconciliation (honest)

- **Naming (item 6):** The canonical palette names are `--atlase-*` per §1 verbatim. The `--color-*` tokens are *aliases* (`var(--atlase-*)`), not the canonical names — the previous note's "kept doc names verbatim as `--color-*`" was inaccurate and has been corrected. `tokens.ts` is a typed object, not CSS, so its keys (`black`, `deep-green`, …) are unchanged and still map to the correct hex.
- A grep confirms all 8 distinct §1 acceptance hexes are present and uppercase, and the alias chain `--color-{token}: var(--atlase-{token})` is intact.

### Verification commands + exit codes

Run from `D:\Code\Personal\Fragnance\atlase` (pnpm 10.33.0, Node 24):

```
$ pnpm --filter @atlase/ui typecheck   # TC_EXIT=0
$ pnpm --filter @atlase/ui build      # BUILD_EXIT=0
$ pnpm --filter @atlase/ui test       # TEST_EXIT=0  (5 passed)

$ rg -n "^    --atlase-" packages/ui/src/styles/tokens.css   # 15 palette + 8 status vars canonical
$ rg -n "^    --color-(black|deep-green|emerald|ivory|muted-gray|black-900|black-600|black-400|ivory-50|ivory-200|emerald-50|emerald-700|gray-500|success|error|warning):" packages/ui/src/styles/tokens.css  # aliases map to var(--atlase-…)
$ rg -n "--container-full: 100%" packages/ui/src/styles/tokens.css   # present
$ rg -n "spring: \{ type:" packages/ui/src/tokens.ts                 # present
$ rg -n "font-family: var\(--font-sans\);" packages/ui/src/styles/tokens.css | grep -i heading-1  # resolved to sans
```

Spot-check (Round 1): `colors.black === '#0A0A0A'` → CSS `--atlase-black: #0A0A0A` / alias `--color-black: var(--atlase-black)` ✓.
