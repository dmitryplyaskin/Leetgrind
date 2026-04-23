import {
  ActionIcon,
  VisuallyHidden,
  useMantineColorScheme,
} from "@mantine/core";
import { Moon, Sun } from "lucide-react";

export interface ThemeToggleProps {
  labels: {
    dark: string;
    light: string;
    toggle: string;
  };
}

export function ThemeToggle({ labels }: ThemeToggleProps) {
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const isDark = colorScheme === "dark";
  const nextLabel = isDark ? labels.light : labels.dark;

  return (
    <ActionIcon
      aria-label={`${labels.toggle}: ${nextLabel}`}
      title={nextLabel}
      type="button"
      variant="subtle"
      color="gray"
      size="lg"
      onClick={() => setColorScheme(isDark ? "light" : "dark")}
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
      <VisuallyHidden>{nextLabel}</VisuallyHidden>
    </ActionIcon>
  );
}
