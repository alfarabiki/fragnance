// Aroma "strength" presets (Lembut/Sedang/Kuat) used to be 3 fixed ml values
// (15/25/35) shared by PerfumeBuilder and CartDrawer. That breaks for any
// fragrance whose min/max range doesn't include those absolute numbers — a
// fragrance with min_ml=30 has zero presets in [15,25,35] range below 35,
// leaving only "Kuat" (or nothing at all for min_ml>35). Presets are now
// computed as percentages of each fragrance's own [minMl, maxMl] range, so
// there are always exactly 3 valid, distinct, in-range options.
export const STRENGTH_LABELS = ["Lembut", "Sedang", "Kuat"] as const;
export const DEFAULT_STRENGTH_PRESET_PERCENTS = [25, 50, 75];

export interface StrengthPreset {
  label: (typeof STRENGTH_LABELS)[number];
  ml: number;
}

export function computeStrengthPresets(
  minMl: number,
  maxMl: number,
  percents: number[] = DEFAULT_STRENGTH_PRESET_PERCENTS,
): StrengthPreset[] {
  return STRENGTH_LABELS.map((label, i) => {
    const pct = percents[i] ?? DEFAULT_STRENGTH_PRESET_PERCENTS[i]!;
    const raw = Math.round(minMl + (pct / 100) * (maxMl - minMl));
    return { label, ml: Math.min(Math.max(raw, minMl), maxMl) };
  });
}
