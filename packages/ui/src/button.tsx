import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./utils";

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--lg-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--lg-bg)] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--lg-primary)] text-[var(--lg-primary-contrast)] hover:bg-[var(--lg-primary-hover)]",
        secondary:
          "border border-[var(--lg-border)] bg-[var(--lg-surface-muted)] text-[var(--lg-text)] hover:bg-[var(--lg-surface-raised)]",
        outline:
          "border border-[var(--lg-border-strong)] bg-transparent text-[var(--lg-text)] hover:bg-[var(--lg-surface-muted)]",
        ghost: "text-[var(--lg-text)] hover:bg-[var(--lg-surface-muted)]",
        danger:
          "bg-[var(--lg-danger)] text-white hover:bg-[var(--lg-danger-hover)]",
      },
      size: {
        sm: "h-9 px-3",
        md: "h-10 px-4",
        lg: "h-11 px-5",
        icon: "h-10 w-10 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";
