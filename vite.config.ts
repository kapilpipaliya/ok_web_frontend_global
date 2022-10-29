/// <reference types="vitest" />

import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";

export default defineConfig({
  plugins: [
    solidPlugin({
      babel: {
        plugins: [
          // Locator JS giving error in windows
          // [
          //   "@locator/babel-jsx/dist",
          //   {
          //     env: "development",
          //   },
          // ],
        ],
      },
    }),
  ],
  build: {
    target: "esnext",
  },
  server: {
    host: "0.0.0.0",
  },
  optimizeDeps: {
    // Add both @codemirror/state and @codemirror/view to included deps for optimization
    include: ["@codemirror/state", "@codemirror/view"],
    extensions: ["jsx"],
    exclude: [
      "@iconify-icon/solid",
    ],
  },
});
