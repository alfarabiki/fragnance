import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../cn";

export const pillVariants = cva(
  "inline-flex items-center justify-center rounded-full font-sans font-medium text-xs min-h-7 px-3 py-1",
  {
    variants: {
      variant: {
        default: "bg-ivory-200 text-black",
        inverse: "bg-black text-ivory",
        active: "bg-emerald text-black",
      },
      interactive: {
        false: "",
        true: "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald focus-visible:ring-offset-2 focus-visible:ring-offset-ivory",
      },
    },
    defaultVariants: { variant: "default", interactive: false },
  },
);

export type PillProps = React.HTMLAttributes<HTMLElement> &
  VariantProps<typeof pillVariants> & {
    pressed?: boolean | undefined;
  };

export const Pill = React.forwardRef<HTMLElement, PillProps>((props, ref) => {
  const { className, variant, interactive, pressed, children, ...rest } = props;
  const classes = cn(pillVariants({ variant, interactive }), className);

  if (interactive) {
    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type="button"
        aria-pressed={pressed === true}
        className={classes}
        {...rest}
      >
        {children}
      </button>
    );
  }

  return (
    <span ref={ref} className={classes} {...rest}>
      {children}
    </span>
  );
});

Pill.displayName = "Pill";
