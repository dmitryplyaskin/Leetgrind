import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@leetgrind/ui";

type Theme = "light" | "dark";

const themeStorageKey = "leetgrind.theme";

function getPreferredTheme(): Theme {
  if (typeof window === "undefined") {
    return "light";
  }

  const savedTheme = window.localStorage.getItem(themeStorageKey);
  if (savedTheme === "light" || savedTheme === "dark") {
    return savedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme(theme: Theme) {
  if (typeof document !== "undefined") {
    document.documentElement.dataset.theme = theme;
  }
}

export function initializeTheme() {
  applyTheme(getPreferredTheme());
}

export interface ThemeToggleProps {
  labels: {
    dark: string;
    light: string;
    toggle: string;
  };
}

export function ThemeToggle({ labels }: ThemeToggleProps) {
  const [theme, setTheme] = useState<Theme>(getPreferredTheme);
  const isDark = theme === "dark";
  const nextLabel = isDark ? labels.light : labels.dark;

  useEffect(() => {
    applyTheme(theme);
    window.localStorage.setItem(themeStorageKey, theme);
  }, [theme]);

  return (
    <Button
      aria-label={`${labels.toggle}: ${nextLabel}`}
      title={nextLabel}
      type="button"
      variant="ghost"
      size="icon"
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      <span className="sr-only">{nextLabel}</span>
    </Button>
  );
}
