/// <reference types="vitest" />
/// <reference types="vite/client" />

import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";
import solidStyled from 'babel-plugin-solid-styled';

export default defineConfig({
  plugins: [
    solidPlugin({
      babel: {
        plugins: [
          // Locator JS
          [
            "@locator/babel-jsx/dist",
            {
              env: "development",
            },
          ],
           [solidStyled, {}]
        ],
      },
    }),
  ],
  build: {
    target: "esnext",
    polyfillDynamicImport: false,
  },
  server: {
    host: "0.0.0.0",
  },
});
