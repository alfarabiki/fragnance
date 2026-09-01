import * as React from "react";
import { cn } from "../cn";

export type SectionHeadingSize = "display-2" | "display-3";

export interface SectionHeadingProps
  extends React.HTMLAttributes<HTMLDivElement> {
  eyebrow?: string | undefined;
  title: string;
  description?: string | undefined;
  titleSize?: SectionHeadingSize | undefined;
}

export const SectionHeading = React.forwardRef<
  HTMLDivElement,
  SectionHeadingProps
>((props, ref) => {
  const {
    eyebrow,
    title,
    description,
    titleSize = "display-2",
    className,
    ...rest
  } = props;

  const titleClass =
    titleSize === "display-3"
      ? "atlase-text-display-3"
      : "atlase-text-display-2";

  return (
    <div ref={ref} className={cn("w-full", className)} {...rest}>
      {eyebrow ? (
        <span className="block w-fit atlase-text-caption">{eyebrow}</span>
      ) : null}
      <h2 className={titleClass}>{title}</h2>
      {description ? (
        <p className="atlase-text-body-lg">{description}</p>
      ) : null}
    </div>
  );
});

SectionHeading.displayName = "SectionHeading";
