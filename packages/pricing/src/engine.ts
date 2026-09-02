export type Money = number;

export interface FragranceRef {
  id: string;
  name: string;
  pricePerMl: Money;
  minMl: number;
  maxMl: number;
}

export interface BottleRef {
  id: string;
  name: string;
  volumeMl: number;
  price: Money;
  active: boolean;
}

export interface PackagingRef {
  id: string;
  name: string;
  price: Money;
  mandatory: boolean;
  active: boolean;
}

export interface AlcoholRef {
  pricePerMl: Money;
}

export interface PricingConfig {
  fragrance: FragranceRef;
  bottle: BottleRef;
  packaging: PackagingRef;
  alcohol: AlcoholRef;
  volumeMl: number;
  fragranceMl: number;
  packagingPriceOverride?: Money | undefined;
  addonsPrice?: Money | undefined;
  discount?: Money | undefined;
  shipping?: Money | undefined;
}

export type PricingErrorCode =
  | "FRAGRANCE_UNAVAILABLE"
  | "FRAGRANCE_UNDER_MIN"
  | "FRAGRANCE_OVER_MAX"
  | "BOTTLE_UNAVAILABLE"
  | "BOTTLE_VOLUME_MISMATCH"
  | "PACKAGING_UNAVAILABLE"
  | "MANDATORY_PACKAGING_REQUIRED"
  | "VOLUME_INCONSISTENT";

export class PricingError extends Error {
  readonly code: PricingErrorCode;

  constructor(code: PricingErrorCode, message: string) {
    super(message);
    this.name = "PricingError";
    this.code = code;
  }
}

export interface LineItemRef {
  label: string;
  unitPrice: Money;
  quantityMl: number;
  amount: Money;
}

export interface PriceQuote {
  lineItems: {
    fragrance: LineItemRef;
    alcohol: LineItemRef;
    bottle: { label: string; amount: Money; volumeMl: number };
    packaging: { label: string; amount: Money };
    addons: Array<{ label: string; amount: Money }>;
  };
  subtotal: Money;
  discount: Money;
  shipping: Money;
  total: Money;
  currency: "IDR";
}

function assert(cond: boolean, code: PricingErrorCode, message: string): void {
  if (!cond) throw new PricingError(code, message);
}

function trunc(n: number): Money {
  return Math.trunc(n);
}

export function calculate(config: PricingConfig): PriceQuote {
  const { fragrance, bottle, packaging, alcohol, volumeMl, fragranceMl } =
    config;

  assert(fragrance !== undefined, "FRAGRANCE_UNAVAILABLE", "Fragrance is required");
  assert(bottle !== undefined, "BOTTLE_UNAVAILABLE", "Bottle is required");
  assert(packaging !== undefined, "PACKAGING_UNAVAILABLE", "Packaging is required");
  assert(alcohol !== undefined, "PACKAGING_UNAVAILABLE", "Alcohol pricing is required");

  assert(bottle.active, "BOTTLE_UNAVAILABLE", `Bottle "${bottle.id}" is unavailable`);
  assert(packaging.active, "PACKAGING_UNAVAILABLE", `Packaging "${packaging.id}" is unavailable`);
  assert(
    !packaging.mandatory || packaging.mandatory === true,
    "MANDATORY_PACKAGING_REQUIRED",
    `Mandatory packaging "${packaging.id}" must be included`,
  );

  const alcoholMl = volumeMl - fragranceMl;
  assert(
    alcoholMl >= 0,
    "VOLUME_INCONSISTENT",
    `volume (${volumeMl}) < fragranceMl (${fragranceMl})`,
  );
  assert(
    fragranceMl >= fragrance.minMl,
    "FRAGRANCE_UNDER_MIN",
    `fragranceMl ${fragranceMl} below min ${fragrance.minMl}`,
  );
  assert(
    fragranceMl <= fragrance.maxMl,
    "FRAGRANCE_OVER_MAX",
    `fragranceMl ${fragranceMl} above max ${fragrance.maxMl}`,
  );
  assert(
    bottle.volumeMl === volumeMl,
    "BOTTLE_VOLUME_MISMATCH",
    `bottle volume ${bottle.volumeMl} != requested ${volumeMl}`,
  );

  const fragranceAmount = trunc(fragranceMl * fragrance.pricePerMl);
  const alcoholAmount = trunc(alcoholMl * alcohol.pricePerMl);
  const bottleAmount = trunc(bottle.price);
  const packagingAmount = trunc(packaging.price);
  const addonsAmount = trunc(config.addonsPrice ?? 0);

  const subtotal =
    fragranceAmount + alcoholAmount + bottleAmount + packagingAmount + addonsAmount;

  const discount = trunc(Math.min(config.discount ?? 0, subtotal));
  const shipping = trunc(config.shipping ?? 0);
  const total = trunc(subtotal - discount + shipping);

  return {
    lineItems: {
      fragrance: {
        label: fragrance.name,
        unitPrice: fragrance.pricePerMl,
        quantityMl: fragranceMl,
        amount: fragranceAmount,
      },
      alcohol: {
        label: "Alkohol",
        unitPrice: alcohol.pricePerMl,
        quantityMl: alcoholMl,
        amount: alcoholAmount,
      },
      bottle: { label: bottle.name, amount: bottleAmount, volumeMl: bottle.volumeMl },
      packaging: { label: packaging.name, amount: packagingAmount },
      addons: [],
    },
    subtotal,
    discount,
    shipping,
    total,
    currency: "IDR",
  };
}

export function validate(config: PricingConfig): void {
  calculate(config);
}