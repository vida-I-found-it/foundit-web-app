import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config";

// Reuses the Vite config so tests resolve "@" and the plugins exactly like the app.
export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: "jsdom",
      include: ["tests/**/*.test.{ts,tsx}"],
      setupFiles: ["./tests/setup.ts"],
      restoreMocks: true,
    },
  }),
);
