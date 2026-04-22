import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./utils";

const badgeVariants = cva(
  "inline-flex h-max items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium",
  {
    variants: {
      variant: {
        neutral:
          "border-[var(--lg-border)] bg-[var(--lg-surface-muted)] text-[var(--lg-muted)]",
        primary:
          "border-[var(--lg-primary-soft)] bg-[var(--lg-primary-soft)] text-[var(--lg-primary-text)]",
        success:
          "border-[var(--lg-success-soft)] bg-[var(--lg-success-soft)] text-[var(--lg-success-text)]",
        warning:
          "border-[var(--lg-warning-soft)] bg-[var(--lg-warning-soft)] text-[var(--lg-warning-text)]",
        danger:
          "border-[var(--lg-danger-soft)] bg-[var(--lg-danger-soft)] text-[var(--lg-danger-text)]",
        info: "border-[var(--lg-info-soft)] bg-[var(--lg-info-soft)] text-[var(--lg-info-text)]",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  },
);

export interface BadgeProps
  extends
    React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, className }))} {...props} />
  );
}
