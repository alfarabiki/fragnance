"use client"
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../cn";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-sans font-semibold text-base leading-none transition-transform duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald focus-visible:ring-offset-2 focus-visible:ring-offset-ivory active:scale-[0.98] min-h-11 rounded-md",
  {
    variants: {
      intent: {
        primary: "bg-emerald text-black hover:bg-emerald-700",
        secondary: "bg-black text-ivory hover:bg-black-600",
        outline: "border border-emerald bg-transparent text-emerald hover:bg-emerald-50",
        ghost: "text-text-primary hover:bg-ivory-50",
        destructive: "bg-error text-ivory",
      },
      size: {
        sm: "px-3 py-2",
        md: "px-4 py-2",
        lg: "px-5 py-3",
        xl: "px-6 py-3",
      },
      rounded: {
        default: "rounded-md",
        full: "rounded-full",
      },
    },
    defaultVariants: {
      intent: "primary",
      size: "md",
      rounded: "default",
    },
  },
);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean | undefined;
    loading?: boolean | undefined;
  };

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => {
    const {
      className,
      intent,
      size,
      rounded,
      asChild,
      loading,
      disabled,
      type = "button",
      children,
      ...rest
    } = props;

    const disabledState = disabled || loading;
    const baseClasses = cn(buttonVariants({ intent, size, rounded }), className);

    if (asChild) {
      return React.cloneElement(
        React.Children.only(children) as React.ReactElement,
        {
          className: baseClasses,
          disabled: disabledState,
          ...rest,
        } as any,
      );
    }

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabledState}
        {...(loading ? { "aria-busy": true as const } : null)}
        className={baseClasses}
        {...rest}
      >
        {loading ? (
          <svg
            className="animate-spin motion-reduce:animate-none"
            width="1em"
            height="1em"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.96 7.96 0 0 1 4 12H0c0 3.042 1.173 5.824 3 7.937l3-2.646z"
            />
          </svg>
        ) : null}
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";

