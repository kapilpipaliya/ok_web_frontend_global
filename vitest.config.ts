import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const rootDir = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  test: {
    include: ["src/lib/graph/**/*.{test,spec}.ts"],
    environment: "node",
    globals: false,
  },
  resolve: {
    alias: {
      "~": resolve(rootDir, "./src"),
      "solid-js/web": "@solidjs/web",
    },
  },
});
