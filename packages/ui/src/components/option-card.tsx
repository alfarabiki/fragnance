"use client"
import * as React from "react";
import { cn } from "../cn";

export interface OptionCardProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "title"> {
  selected: boolean;
  title: React.ReactNode;
  description?: React.ReactNode;
  badge?: React.ReactNode;
}

/**
 * Selectable option tile (fragrance/bottle/packaging pickers). Selected and
 * unselected states each own a matched border+background+text combination —
 * this exists specifically because hand-rolled ternaries kept flipping the
 * background light without flipping the text, leaving invisible ivory-on-
 * pale-mint text (§ perfume builder step 1/4/5).
 */
export const OptionCard = React.forwardRef<HTMLButtonElement, OptionCardProps>(
  ({ selected, title, description, badge, className, ...rest }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        aria-pressed={selected}
        className={cn(
          "rounded-lg border p-4 text-left transition",
          selected
            ? "border-emerald bg-emerald-50"
            : "border-black-400 bg-black-600",
          className,
        )}
        {...rest}
      >
        <span
          className={cn(
            "block text-body font-medium",
            selected ? "text-emerald-700" : "text-ivory",
          )}
        >
          {title}
        </span>
        {description ? (
          <span
            className={cn(
              "block text-caption",
              selected ? "text-emerald-700/70" : "text-muted-gray",
            )}
          >
            {description}
          </span>
        ) : null}
        {badge ? <span className="mt-2 block">{badge}</span> : null}
      </button>
    );
  },
);

OptionCard.displayName = "OptionCard";
