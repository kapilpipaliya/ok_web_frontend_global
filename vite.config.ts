/// <reference types="vitest" />

import { defineConfig, Plugin } from "vite";
import solidPlugin from "vite-plugin-solid";
import devtools from 'solid-devtools/vite'
import type { ImportSpecifier } from 'es-module-lexer'
import { init, parse } from 'es-module-lexer'
import MagicString from 'magic-string'

let needSourcemap = false

const isBuildForWeb = !process.env.admin

// write a plugin to comment devExpress import using this plugin:
// https://github.com/vbenjs/vite-plugin-style-import/blob/main/packages/core/src/index.ts
// Other Similar Plugin reference:  https://github.com/vite-plugin/vite-plugin-dynamic-import/blob/main/src/index.ts
function removeDevExpressImport(options = {}): Plugin {
 return {
  name: 'output-plugin-stats',
  configResolved(config)
  {
   needSourcemap = !!config.build.sourcemap
  },
  async transform(code, id) {
   if (!code || !needTransform(code)) {
    return null
   }

   let imports: readonly ImportSpecifier[] = []
   try {
    imports = parse(code)[0]
   } catch (e) {
    console.error(e)
   }
   if (!imports.length) {
    return null
   }

   let s: MagicString | undefined
   const str = () => s || (s = new MagicString(code))

   for (let index = 0; index < imports.length; index++) {
    const { n, se, ss } = imports[index]
    if (!n) continue

    const importStr = code.slice(ss, se)

    if (needTransform(importStr)) {
     str().appendLeft(ss, '//')
    }
   }
   return {
    map: needSourcemap ? str().generateMap({ hires: true }) : null,
    code: str().toString(),
   }
  }
 }
}

// Do you need to process code
function needTransform(code: string) {
 return code.includes("devextreme/") || code.includes("jsx_parser/source/components/JsxParser") || code.includes(`import csvtojson from "csvtojson"`) || code.includes(`from "yaml"`) || code.includes(`from "../examples/data`) || code.includes(`from "../pages/BackupRestore"`) || code.includes("/PageDesignerDragAndDrop");
}

const alias = {} as {[key: string]: string};
if (!isBuildForWeb) {
 Object.assign(alias, {
  "devextreme/ui": 'devextreme/esm/ui'
 })
}
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
  }),
  isBuildForWeb && removeDevExpressImport()
 ],
 define: {
  '__APP_VERSION__': JSON.stringify(process.env.npm_package_version),
 },
 build: {
  outDir: isBuildForWeb ? 'distweb' : `distadmin`,
  target: "esnext",
  rollupOptions: {
   output: {
    entryFileNames: `${isBuildForWeb ? "assets_web" : "assets"}/[name]-[hash].js`,
    chunkFileNames: `${isBuildForWeb ? "assets_web" : "assets"}/[name]-[hash].js`,
    assetFileNames: `${isBuildForWeb ? "assets_web" : "assets"}/[name]-[hash].[ext]`,
   },
  },
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
  alias
 },
});
