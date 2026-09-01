import * as React from "react";
import { cn } from "../cn";
import type { SpacingToken } from "../tokens";

export type ContainerProps = React.HTMLAttributes<HTMLDivElement>;

export const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  (props, ref) => {
    const { className, ...rest } = props;
    return (
      <div
        ref={ref}
        className={cn("mx-auto max-w-(--container-xl) px-4 sm:px-6", className)}
        {...rest}
      />
    );
  },
);

Container.displayName = "Container";

export type StackProps = React.HTMLAttributes<HTMLDivElement> & {
  gap?: SpacingToken | undefined;
};

export const Stack = React.forwardRef<HTMLDivElement, StackProps>((props, ref) => {
  const { className, gap = 4, ...rest } = props;
  return (
    <div
      ref={ref}
      className={cn("flex flex-col", `gap-(--space-${gap})`, className)}
      {...rest}
    />
  );
});

Stack.displayName = "Stack";
