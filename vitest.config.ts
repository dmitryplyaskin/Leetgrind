import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./vitest.setup.ts"],
    include: ["apps/**/*.{test,spec}.{ts,tsx}", "packages/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["**/dist/**", "**/node_modules/**", "**/e2e/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["apps/**/*.{ts,tsx}", "packages/**/*.{ts,tsx}"],
      exclude: [
        "**/*.config.ts",
        "**/*.d.ts",
        "**/dist/**",
        "**/node_modules/**",
        "apps/web/src/main.tsx"
      ]
    },
    environmentMatchGlobs: [["**/*.{test,spec}.tsx", "jsdom"]]
  }
});

