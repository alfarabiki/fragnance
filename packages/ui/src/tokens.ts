export const colors = {
  black: "#0A0A0A",
  "deep-green": "#0D6B4D",
  emerald: "#19A974",
  ivory: "#F5F2EA",
  "muted-gray": "#9A9A93",
  "black-900": "#0A0A0A",
  "black-600": "#2A2A28",
  "black-400": "#4A4A47",
  "ivory-50": "#FBF9F4",
  "ivory-200": "#EDE8DC",
  "emerald-50": "#E9F7F2",
  "emerald-700": "#0E7A55",
  "gray-500": "#9A9A93",
  success: "#1E8E5A",
  error: "#C0392B",
  warning: "#B7791F",
} as const;

export type ColorName = keyof typeof colors;

export const spacing = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  16: 64,
  24: 96,
  32: 128,
} as const;

export type SpacingToken = keyof typeof spacing;

export const durations = {
  fast: 150,
  base: 300,
  slow: 500,
  hero: 1200,
} as const;

export type DurationToken = keyof typeof durations;

export const eases = {
  ui: "cubic-bezier(0.22, 1, 0.36, 1)",
  subtle: "cubic-bezier(0.4, 0, 0.2, 1)",
  hero: "cubic-bezier(0.16, 1, 0.3, 1)",
  spring: { type: "spring", stiffness: 260, damping: 26 },
} as const;

export type EaseToken = keyof typeof eases;

export const radius = {
  none: 0,
  sm: 6,
  md: 10,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export type RadiusToken = keyof typeof radius;

export const zIndex = {
  base: 0,
  sticky: 100,
  fab: 150,
  overlay: 200,
  dropdown: 300,
  sheet: 400,
  modal: 500,
  toast: 600,
} as const;

export type ZIndexToken = keyof typeof zIndex;

export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

export type BreakpointToken = keyof typeof breakpoints;

export const containers = {
  sm: 480,
  md: 720,
  lg: 1080,
  xl: 1280,
  full: "100%",
} as const;

export type ContainerToken = keyof typeof containers;
