export interface FormatRupiahOptions {
  prefix?: boolean | undefined;
  useNbsp?: boolean | undefined;
}

const formatter = new Intl.NumberFormat("id-ID");

export function formatRupiah(amount: number, options?: FormatRupiahOptions): string {
  const value = amount < 0 ? 0 : Math.trunc(amount);
  const digits = formatter.format(value);
  const separator = options?.useNbsp === true ? "\u00A0" : "";
  const rendered = `${separator}Rp${digits}`;
  if (options?.prefix === true) {
    return `Mulai dari ${rendered}`;
  }
  return rendered;
}
