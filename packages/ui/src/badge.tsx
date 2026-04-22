import { Badge as MantineBadge } from "@mantine/core";
import type { BadgeProps as MantineBadgeProps } from "@mantine/core";

const variantColors = {
  neutral: "gray",
  primary: "teal",
  success: "green",
  warning: "yellow",
  danger: "red",
  info: "blue",
} as const;

export interface BadgeProps extends Omit<
  MantineBadgeProps,
  "variant" | "color"
> {
  variant?: keyof typeof variantColors;
}

export function Badge({ variant = "neutral", ...props }: BadgeProps) {
  return (
    <MantineBadge
      color={variantColors[variant]}
      radius="sm"
      variant="light"
      {...props}
    />
  );
}
