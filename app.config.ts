import { defineConfig } from "@solidjs/start/config";
import type { PluginOption } from "vite";
import solidStyled from "vite-plugin-solid-styled";

export default defineConfig({
  vite: {
    // dev: {
    //   force: false,
    //   https: false,
    //   port: 3001,
    //   devtools: true,
    //   ws: {
    //     port: 1100
    //   }
    // },
    server: {
      // port: 36075, // Change this to the desired port number for the server
      hmr: {
        port: 2900, // Change this to the desired port number for HMR
      },
    },
    plugins: [
      solidStyled({
        filter: {
          include: "src/**/*.tsx",
          exclude: "node_modules/**/*.{ts,js}",
        },
      }) as PluginOption,
    ],
  },
});
