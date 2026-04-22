import { createTheme } from "@mantine/core";

export const leetgrindTheme = createTheme({
  primaryColor: "teal",
  primaryShade: { light: 7, dark: 4 },
  defaultRadius: "sm",
  fontFamily:
    "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
  headings: {
    fontFamily:
      "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
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
        shadow: "xs",
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
