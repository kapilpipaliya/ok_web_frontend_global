/// <reference types="vitest" />
/// <reference types="vite/client" />

import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";
import solidStyled from 'babel-plugin-solid-styled';
import solidLabels from 'babel-plugin-solid-labels';

export default defineConfig({
  plugins: [
    solidPlugin({
      babel: {
        plugins: [
          [solidLabels, { dev: false }],
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
