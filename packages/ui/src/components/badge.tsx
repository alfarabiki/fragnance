"use client"
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../cn";

export const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full font-sans font-medium text-xs min-h-7 px-3 py-1",
  {
    variants: {
      variant: {
        success: "bg-success text-ivory",
        error: "bg-error text-ivory",
        warning: "bg-warning text-black",
        info: "bg-emerald-50 text-emerald-700",
        neutral: "bg-ivory-200 text-text-primary",
      },
    },
    defaultVariants: { variant: "neutral" },
  },
);

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof badgeVariants>;

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (props, ref) => {
    const { className, variant, ...rest } = props;
    return (
      <span
        ref={ref}
        className={cn(badgeVariants({ variant }), className)}
        {...rest}
      />
    );
  },
);

Badge.displayName = "Badge";

