import { createTheme, defaultCssVariablesResolver } from "@mantine/core";
import type { CSSVariablesResolver } from "@mantine/core";

const sansFont =
  "Figtree Variable, Figtree, Avenir Next, Avenir, Segoe UI, sans-serif";
const monoFont =
  "JetBrains Mono, SFMono-Regular, Consolas, Liberation Mono, monospace";

export const leetgrindTheme = createTheme({
  primaryColor: "teal",
  primaryShade: { light: 7, dark: 4 },
  defaultRadius: "sm",
  fontFamily: sansFont,
  fontFamilyMonospace: monoFont,
  headings: {
    fontFamily: sansFont,
    fontWeight: "700",
  },
  colors: {
    teal: [
      "#eefbf5",
      "#d9efe6",
      "#b6dfcf",
      "#8fcdb6",
      "#68bb9d",
      "#47aa87",
      "#2f8d6d",
      "#256f55",
      "#1e5f49",
      "#164536",
    ],
  },
  components: {
    Card: {
      defaultProps: {
        radius: "sm",
        shadow: "none",
        withBorder: true,
      },
    },
    Button: {
      defaultProps: {
        radius: "sm",
      },
    },
    TextInput: {
      defaultProps: {
        radius: "sm",
      },
    },
    Textarea: {
      defaultProps: {
        radius: "sm",
      },
    },
    NativeSelect: {
      defaultProps: {
        radius: "sm",
      },
    },
  },
});

export const leetgrindCssVariablesResolver: CSSVariablesResolver = (theme) => {
  const defaultVariables = defaultCssVariablesResolver(theme);

  return {
    variables: {
      ...defaultVariables.variables,
      "--lg-font-sans": sansFont,
      "--lg-font-mono": monoFont,
      "--lg-radius-panel": "8px",
      "--lg-radius-control": "6px",
      "--lg-space-section": "clamp(3rem, 7vw, 6rem)",
      "--lg-space-panel": "clamp(1rem, 2vw, 1.5rem)",
      "--lg-focus-ring": "0 0 0 3px color-mix(in srgb, var(--lg-color-accent) 28%, transparent)",
    },
    light: {
      ...defaultVariables.light,
      "--lg-color-canvas": "#f7f8f4",
      "--lg-color-surface": "#ffffff",
      "--lg-color-surface-subtle": "#eef3ed",
      "--lg-color-text": "#18211d",
      "--lg-color-muted": "#5d6a63",
      "--lg-color-accent": "#24735b",
      "--lg-color-accent-strong": "#164536",
      "--lg-color-border": "rgba(24, 33, 29, 0.14)",
    },
    dark: {
      ...defaultVariables.dark,
      "--lg-color-canvas": "#101512",
      "--lg-color-surface": "#171e1a",
      "--lg-color-surface-subtle": "#1d2a24",
      "--lg-color-text": "#edf4ef",
      "--lg-color-muted": "#b5c4ba",
      "--lg-color-accent": "#68bb9d",
      "--lg-color-accent-strong": "#d9efe6",
      "--lg-color-border": "rgba(237, 244, 239, 0.16)",
    },
  };
};
