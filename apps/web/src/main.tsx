import React from "react";
import ReactDOM from "react-dom/client";
import { MantineProvider, localStorageColorSchemeManager } from "@mantine/core";
import "@mantine/core/styles.css";
import { leetgrindTheme } from "@leetgrind/ui";
import { AppRouterProvider } from "./app";
import "./styles.css";

const colorSchemeManager = localStorageColorSchemeManager({
  key: "leetgrind.theme",
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <MantineProvider
      colorSchemeManager={colorSchemeManager}
      defaultColorScheme="auto"
      theme={leetgrindTheme}
    >
      <AppRouterProvider />
    </MantineProvider>
  </React.StrictMode>,
);
