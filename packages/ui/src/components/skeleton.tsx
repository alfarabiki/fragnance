"use client"
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../cn";

export const skeletonVariants = cva(
  "bg-ivory-200 dark:bg-black-400 animate-pulse motion-reduce:animate-none rounded-md",
  {
    variants: {
      variant: {
        text: "h-4 w-3/4 rounded-sm",
        rect: "h-6 w-full",
        circle: "h-8 w-8 rounded-full",
      },
    },
    defaultVariants: { variant: "rect" },
  },
);

export type SkeletonProps = React.HTMLAttributes<HTMLElement> &
  VariantProps<typeof skeletonVariants>;

export const Skeleton = React.forwardRef<HTMLElement, SkeletonProps>(
  (props, ref) => {
    const { className, variant, ...rest } = props;
    return (
      <span
        ref={ref}
        aria-hidden="true"
        className={cn(skeletonVariants({ variant }), className)}
        {...rest}
      />
    );
  },
);

Skeleton.displayName = "Skeleton";

