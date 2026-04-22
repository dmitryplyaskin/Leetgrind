import React from "react";
import ReactDOM from "react-dom/client";
import { AppRouterProvider } from "./app";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <AppRouterProvider />
  </React.StrictMode>
);
