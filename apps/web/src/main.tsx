import React from "react";
import ReactDOM from "react-dom/client";
import { MantineProvider, localStorageColorSchemeManager } from "@mantine/core";
import "@mantine/core/styles.css";
import "@fontsource-variable/figtree/index.css";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/600.css";
import { leetgrindCssVariablesResolver, leetgrindTheme } from "@leetgrind/ui";
import { AppRouterProvider } from "./app";
import "./styles.css";

const colorSchemeManager = localStorageColorSchemeManager({
  key: "leetgrind.theme",
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <MantineProvider
      colorSchemeManager={colorSchemeManager}
      cssVariablesResolver={leetgrindCssVariablesResolver}
      defaultColorScheme="auto"
      theme={leetgrindTheme}
    >
      <AppRouterProvider />
    </MantineProvider>
  </React.StrictMode>,
);
