import * as React from "react";
import { cn } from "../cn";
import { formatRupiah } from "../format-rupiah";

export interface PriceDisplayBreakdownItem {
  label: string;
  value: number;
}

export interface PriceDisplayProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "prefix"> {
  price: number;
  prefix?: boolean | undefined;
  useNbsp?: boolean | undefined;
  sub?: string | undefined;
  breakdown?: ReadonlyArray<PriceDisplayBreakdownItem> | undefined;
}

export const PriceDisplay = React.forwardRef<HTMLDivElement, PriceDisplayProps>(
  (props, ref) => {
    const {
      price,
      prefix,
      useNbsp,
      sub,
      breakdown,
      className,
      ...rest
    } = props;

    const formatted = formatRupiah(price, { prefix, useNbsp });

    return (
      <div ref={ref} className={cn("flex flex-col", className)} {...rest}>
        <span className="atlase-text-price">{formatted}</span>
        {sub ? (
          <span className="atlase-text-caption text-muted-gray">{sub}</span>
        ) : null}
        {breakdown ? (
          <dl className="mt-(--space-1) flex flex-col gap-(--space-1)">
            {breakdown.map((item) => (
              <div
                key={item.label}
                className="atlase-text-caption text-muted-gray"
              >
                <dt className="font-sans font-medium">{item.label}:</dt>{" "}
                <dd>{formatRupiah(item.value)}</dd>
              </div>
            ))}
          </dl>
        ) : null}
      </div>
    );
  },
);

PriceDisplay.displayName = "PriceDisplay";
