/// <reference types="vitest" />

import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";
import devtools from 'solid-devtools/vite'


export default defineConfig({
 plugins: [
  devtools({
   /* additional options */
   autoname: true, // e.g. enable autoname
  }),
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
    ]
   }
  })
 ],
 define: {
  '__APP_VERSION__': JSON.stringify(process.env.npm_package_version),
 },
 build: {
  target: "esnext"
 },
 server: {
  host: "0.0.0.0"
 },
 optimizeDeps: {
  // Add both @codemirror/state and @codemirror/view to included deps for optimization
  include: ["@codemirror/state", "@codemirror/view"],
  extensions: ["jsx"],
  exclude: [
   "@iconify-icon/solid"
  ]
 },
 test: {
  environment: "jsdom",
  globals: true,
  transformMode: {
   web: [/\.[jt]sx?$/]
  },
  setupFiles: ["node_modules/@testing-library/jest-dom/extend-expect.js"],
  // otherwise, solid would be loaded twice:
  deps: {
   registerNodeLoader: true,
   // https://github.com/solidjs/solid-testing-library/issues/10
   // solid and solid-testing-library need to be inline to work around a
   // resolution issue in vitest. If you encounter an error like:
   // `'solid-js/web' does not provide an export named 'hydrate'`,
   // you probably need to add something to this list. Setting this to
   // `[/node_modules/`] will almost certainly solve the problem, but might
   // impact performance. For more infor see solidjs/solid-testing-library#10
   // and vitest-dev/vitest#1588.
   inline: [
    /solid-js/,
    /solid-testing-library/
   ]
  },
  // if you have few tests, try commenting one
  // or both out to improve performance:
  threads: false,
  isolate: false
 },
 resolve: {
  conditions: ["development", "browser"],
  // devexpress tree shaking issue:
  // https://supportcenter.devexpress.com/ticket/details/t1055230/the-cannot-read-properties-of-undefined-reading-render-error-occurs-in-vite-2-7-6-in
  // devexpress not working in production issue: https://supportcenter.devexpress.com/ticket/details/t1054272/vue3-react-vite-rollup-devextreme-fails-in-production-because-some-modules-do-not-pass
  alias: {
   "devextreme/ui": 'devextreme/esm/ui'
  }
 },
});
