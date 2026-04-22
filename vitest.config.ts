import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const sourcePath = (path: string) => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@leetgrind/agents": sourcePath("./packages/agents/src/index.ts"),
      "@leetgrind/ai": sourcePath("./packages/ai/src/index.ts"),
      "@leetgrind/code-runner": sourcePath("./packages/code-runner/src/index.ts"),
      "@leetgrind/db": sourcePath("./packages/db/src/index.ts"),
      "@leetgrind/domain": sourcePath("./packages/domain/src/index.ts"),
      "@leetgrind/rag": sourcePath("./packages/rag/src/index.ts"),
      "@leetgrind/scheduling": sourcePath("./packages/scheduling/src/index.ts"),
      "@leetgrind/shared": sourcePath("./packages/shared/src/index.ts"),
      "@leetgrind/ui": sourcePath("./packages/ui/src/index.ts")
    }
  },
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
