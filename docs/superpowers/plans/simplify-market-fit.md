# Plan: Simplify storefront + admin for a middle-to-low income market

## Context

ATLASE targets an Indonesian middle-to-low income market (Claude.MD §0-2).
Every extra tap, field, or ambiguous choice is real friction for this
audience — reducing them is directly on-brand, not cosmetic polish.

This plan was scoped in conversation with the human partner, who reviewed
and approved all five tasks ("Oke go all"). Read `Claude.MD` at the repo
root before starting — it is this plan's spec; sections referenced below
(e.g. §37, §39) are its section numbers. Where a task's simplification
narrows something §37 asks for in more detail, that tradeoff is called out
explicitly in the task and is a deliberate, approved deviation — not an
oversight to "fix" back to the letter of §37.

## Spec

`Claude.MD` (repo root, one level above `atlase/`).

## Global Constraints

- Money stays integer rupiah everywhere touched (§50) — no floats introduced.
- Bahasa Indonesia sederhana for all user-facing copy (§3); no perfume-industry
  jargon.
- Every task must leave `pnpm typecheck`, `pnpm test`, and `pnpm lint` green
  for whichever workspace(s) it touches.
- Any task touching `apps/web` must leave the existing e2e suite green
  (`pnpm test:e2e`, run with `--workers=1` if the default parallel run shows
  flakiness — this repo's dev-server-backed e2e is known to flake under high
  parallelism; a single-worker rerun is the tie-breaker, not a real failure).
- Reuse existing design tokens / `@atlase/ui` components — do not invent new
  ad-hoc colors, spacing, or one-off components when an existing primitive
  covers the need.
- No new external dependencies for any task in this plan.

## Tasks

### Task 1: Hero — remove the duplicate CTA

**File:** `apps/web/app/page.tsx`

The hero currently renders two buttons that both link to `/buat-parfum`:
`Pilih Aroma` (intent="primary") and `Buat Parfum` (intent="outline"). Same
destination, two labels — this is confusing, not a real choice.

Remove the second button (`Buat Parfum`, intent="outline"). Keep exactly one
CTA in the hero: the primary button, label `Pilih Aroma`, still linking to
`/buat-parfum`. Do not change anything else in the hero section (copy,
motion, ScentField, PriceTicker, badge).

After the change, the hero's button row (`StaggerItem` wrapping the CTA(s))
should contain a single `Button`, not a flex row of two.

**Verification:** `pnpm --filter @atlase/web typecheck && pnpm --filter @atlase/web build`. Visually confirm (Playwright screenshot at 1280x900) the hero shows one button, not two.

---

### Task 2: Packaging descriptions — real copy per option, not one generic line

**Files:** `packages/config/src/catalog.ts`, `apps/admin/components/fragrance-manager.tsx` is NOT in scope (packaging isn't fragrance-scoped); `apps/web/components/PerfumeBuilder.tsx`

Today `PerfumeBuilder.tsx`'s packaging `OptionCard` hardcodes the exact same
description for every packaging option: `"Terinspirasi keindahan
persembahan"` (see the `packaging.map(...)` block, step 5 "Pilih Packaging").
It does not help the customer differentiate Standard / Premium Box / Gift —
same text for all three defeats the point of a description.

1. In `packages/config/src/catalog.ts`, find the `CatalogPackaging`
   interface and the `packaging` array (currently `pkg-standard`,
   `pkg-premium`, `pkg-gift`). Add a `description: string` field to the
   interface, and give each of the three existing entries a short (≤6 words),
   distinct, Bahasa Indonesia sederhana description:
   - `pkg-standard` ("Standard"): `"Simpel, rapi, langsung kirim"`
   - `pkg-premium` ("Premium Box"): `"Kotak eksklusif, kesan lebih mewah"`
   - `pkg-gift` ("Gift"): `"Siap kasih ke orang tersayang"`
2. In `apps/web/components/PerfumeBuilder.tsx`, the packaging `OptionCard`
   currently passes the literal string `"Terinspirasi keindahan
   persembahan"` as `description`. Change it to `p.description` (reading
   from the config object, same pattern already used for the fragrance and
   bottle `OptionCard`s above it in the same file).

**Verification:** `pnpm --filter @atlase/config typecheck && pnpm --filter @atlase/web typecheck && pnpm --filter @atlase/web test`. Visually confirm (Playwright screenshot of `/buat-parfum` step 5) the three packaging cards show three different description lines.

---

### Task 3: Checkout address form — collapse to the fields that matter for a WhatsApp-manual fulfillment flow

**File:** `apps/web/app/checkout/page.tsx`

**Deliberate deviation from §37, approved by the human partner in
conversation:** §37 lists Provinsi/Kota/Kecamatan/Kode Pos as separate
fields, aimed at a future automated-courier integration. ATLASE's current
fulfillment is 100% manual: a human reads the WhatsApp message and ships it
themselves (§5, §81 — shipping is explicitly "keep simple" at this stage).
Four separate region fields are typing overhead on a phone with zero
functional payoff today. This task trades that future-proofing for less
friction now; if/when automated courier integration is built, these fields
return then, not before.

Current `OrderAddress` shape (`apps/web/lib/whatsapp.ts`) and the checkout
form (`apps/web/app/checkout/page.tsx`) collect: `recipientName`, `phone`,
`fullAddress`, `district`, `city`, `province`, `postalCode`, `note`.

Collapse the checkout address step to four inputs, in this order:
1. **Nama** (`recipientName`) — unchanged, text input, placeholder "Nama lengkap".
2. **Nomor WhatsApp** (`phone`) — unchanged, text input with "+62" prefix, placeholder "08xx".
3. **Alamat Lengkap** (`fullAddress`) — unchanged textarea, but its label/placeholder should now ask for the FULL address including kecamatan/kota/provinsi in one block, e.g. placeholder: `"Nama jalan, no rumah, RT/RW, kecamatan, kota, provinsi"`.
4. **Kode Pos** (`postalCode`) — unchanged, 5-digit input.

Remove the separate **Provinsi**, **Kota/Kabupaten**, and **Kecamatan**
input fields from the form and from `addressValid` — validation should now
require: `recipientName.length >= 2`, `phone` digits `>= 9`,
`fullAddress.length >= 5`, `postalCode` matches `/^\d{5}$/`. Do not remove
the optional **Catatan** field.

Keep the `OrderAddress` TypeScript type (`apps/web/lib/whatsapp.ts`) and the
`/api/orders` request shape UNCHANGED — still send `provinsi`, `kota`,
`kecamatan` in the API payload — but derive them from the single
`fullAddress` value: set `provinsi: ""`, `kota: ""`, `kecamatan: fullAddress`
is wrong; instead, on submit, send the full text in `fullAddress` and leave
`provinsi`/`kota`/`kecamatan` as empty strings (`""`). The WhatsApp message
builder (`apps/web/lib/whatsapp.ts` `buildWhatsAppMessage`) already renders
whatever is in each field — empty province/city/district lines are
acceptable for this task (a later task can clean up the message template if
that becomes visibly awkward; out of scope here). Do NOT change
`apps/web/lib/whatsapp.ts` or the `/api/orders` route in this task — only
the checkout page's form fields, state, and validation.

**Verification:** `pnpm --filter @atlase/web typecheck && pnpm --filter @atlase/web build`. Update `e2e/tests/full-whatsapp.spec.ts` and `e2e/tests/full-qris.spec.ts` — both currently fill `input[placeholder="e.g. DKI Jakarta"]`, `input[placeholder="e.g. Jakarta Selatan"]`, `input[placeholder="e.g. Kebayoran Baru"]`, which will no longer exist; remove those three `page.fill(...)` lines from both specs (the remaining `Nama`, `08xx`, `5 digit`, and the `textarea[placeholder^="Nama jalan"]` fills stay — update that textarea's fill value to a single string containing a full address, e.g. `"Jl. Wolter Monginsidi No. 21, Kebayoran Baru, Jakarta Selatan, DKI Jakarta"`). Run `pnpm test:e2e` for both specs and confirm they pass (rerun with `--workers=1` if a parallel run flakes, per Global Constraints).

---

### Task 4: Landing page — merge "Featured Fragrances" and "Premium Showcase" into one section

**File:** `apps/web/app/page.tsx`

Sections 4 ("Featured Fragrances", `id="aroma"`, shows 3 `ProductCard`s in a
grid) and 8 ("Premium Showcase", `Ragam Wangi Mewah`, shows 2 photo cards
"Top Note"/"Base Note") both show product imagery back-to-back in the same
scroll, several sections apart, with no distinct job — a customer who wants
to buy quickly scrolls past redundant product content twice.

Merge them into a single section, keeping section 4's position (`id="aroma"`,
right after the "Starting Price" band) and section 4's heading
(`eyebrow="Koleksi"`, `title="Pilih aroma favoritmu"`,
`description="Setiap aroma bisa kamu sesuaikan kekuatannya."`). Remove
section 8 entirely (its own heading "Showcase"/"Ragam Wangi Mewah" and
wrapping `<section>`).

Below the existing 3-card `ProductCard` grid (unchanged), add the two photo
cards from the old section 8 (the `showcase-fresh.jpg` "Aroma Segar"/Top Note
card and `showcase-warm.jpg` "Aroma Hangat"/Base Note card, with their
`Image`, gradient overlay, badge, heading, and caption exactly as they are
today) in their own `StaggerGroup` row directly under the product grid,
inside the same `<section id="aroma">`. Keep every visual detail of both the
`ProductCard` grid and the photo-card row unchanged — this task only moves
the photo-card markup into section 4 and deletes the now-empty section 8;
it does not restyle either.

Section numbering in the `{/* N. ... */}` comments after section 8
(currently 9-12: Testimonials, FAQ, WhatsApp CTA, Footer) shifts down by one
— update those comments to 8-11.

**Verification:** `pnpm --filter @atlase/web typecheck && pnpm --filter @atlase/web build`. Playwright screenshot of the merged section confirming both the 3-card grid and the 2 photo cards render inside it, and that a separate "Ragam Wangi Mewah" section no longer exists on the page (`page.getByText("Ragam Wangi Mewah")` should not match).

---

### Task 5: Admin sidebar — hide nav links to unbuilt stub modules

**File:** `apps/admin/components/admin-sidebar.tsx`, plus each stub page listed below

`ADMIN_MODULES` in `admin-sidebar.tsx` lists 14 modules. Several route to
pages that are pure placeholders — literally `<CardContent
className="text-sm text-muted-foreground">Belum ada data.</CardContent>`
with no data fetching at all (verify each by reading the file before
touching the list — do not trust this description over the actual file
contents). Confirm the stub pattern in these files, then remove the
corresponding entries from the `ADMIN_MODULES` array (not the page files
themselves — the routes should still work if visited directly, just not be
advertised in the nav):

- `apps/admin/app/(dashboard)/bottles/page.tsx` → remove `{ key: "bottles", ... }`
- `apps/admin/app/(dashboard)/packaging/page.tsx` → remove `{ key: "packaging", ... }`
- `apps/admin/app/(dashboard)/customers/page.tsx` → remove `{ key: "customers", ... }`
- `apps/admin/app/(dashboard)/payments/page.tsx` → remove `{ key: "payments", ... }`
- `apps/admin/app/(dashboard)/whatsapp/page.tsx` → remove `{ key: "whatsapp", ... }`
- `apps/admin/app/(dashboard)/promotions/page.tsx` → remove `{ key: "promotions", ... }`
- `apps/admin/app/(dashboard)/analytics/page.tsx` → remove `{ key: "analytics", ... }`
- `apps/admin/app/(dashboard)/audit/page.tsx` → remove `{ key: "audit", ... }`
- `apps/admin/app/(dashboard)/settings/page.tsx` → remove `{ key: "settings", ... }`

Do NOT remove: `dashboard`, `orders`, `fragrances`, `pricing`, `inventory` —
read each of these five before assuming they're real; only remove entries
you've confirmed (by reading the page file) are the hardcoded stub pattern
above. If a page on this "remove" list turns out NOT to be a stub (has real
data fetching), leave its nav entry in place and note that in your report —
do not remove a working module's nav link.

**Verification:** `pnpm --filter @atlase/admin typecheck && pnpm --filter @atlase/admin build`. Playwright screenshot of the admin sidebar confirming only the modules you actually kept are listed. The removed pages must still exist as files and still build — this task only edits the `ADMIN_MODULES` array, not the page components.

---

## Task independence

All five tasks touch disjoint files (Task 1 and Task 4 both touch
`apps/web/app/page.tsx` but different, non-adjacent sections — Task 1 edits
the hero near the top of the file, Task 4 edits sections 4/8 further down;
dispatch them sequentially, not in parallel, and note the merge order in the
ledger). Tasks 2 and 3 both touch `apps/web/components/PerfumeBuilder.tsx`
— Task 2 only touches the packaging `OptionCard` block (step 5), Task 3
does not touch `PerfumeBuilder.tsx` at all (only `checkout/page.tsx`) — no
actual conflict, just note it. Task 5 is fully isolated to the admin app.
