import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { solidStart } from "@solidjs/start/config";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";
// import mkcert from "vite-plugin-mkcert";
// import devtools from 'solid-devtools/vite';

const require = createRequire(import.meta.url);
const chromiumBidiRoot = dirname(require.resolve("chromium-bidi/package.json"));

export default defineConfig({
  plugins: [
    solidStart({
      middleware: "./src/middleware.ts",
    }),
    nitro(),
    // mkcert(),
    // monaco-editor gives error in devtools
    // devtools({
    //   /* features options - all disabled by default */
    //   autoname: true,
    // }),
  ],
  resolve: {
    // playwright-core still imports chromium-bidi's old lib/cjs paths
    alias: {
      "chromium-bidi/lib/cjs/bidiMapper/BidiMapper": join(
        chromiumBidiRoot,
        "out/Default/gen/src/bidiMapper/BidiMapper.js",
      ),
      "chromium-bidi/lib/cjs/cdp/CdpConnection": join(
        chromiumBidiRoot,
        "out/Default/gen/src/cdp/CdpConnection.js",
      ),
    },
  },
  nitro: {
    experimental: {
      websocket: true,
    },
    // Only hashed static assets may be cached. Pages like /books must not be —
    // otherwise LiteSpeed/browsers serve stale HTML per custom domain.
    // Dev: Vite URLs are unhashed; never immutable-cache them.
    routeRules: {
      "/_build/**": {
        headers: {
          "Cache-Control":
            process.env.NODE_ENV === "production"
              ? "public, max-age=31536000, immutable"
              : "no-store",
        },
      },
      // Static SW at /admin-sw.js must advertise broader scope for /admin.
      "/admin-sw.js": {
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Service-Worker-Allowed": "/",
          "Content-Type": "application/javascript; charset=utf-8",
        },
      },
      "/api/admin-pwa/sw": {
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Service-Worker-Allowed": "/",
          "Content-Type": "application/javascript; charset=utf-8",
        },
      },
      "/api/admin-pwa/manifest": {
        headers: {
          "Cache-Control": "no-cache",
          "Content-Type": "application/manifest+json",
        },
      },
    },
    // https: true,
  },
  server: {
    // If set to true, the server is allowed to respond to requests for any hosts.
    allowedHosts: true,
    // https: true,
  },
  build: {
    rollupOptions: {
      external: [
        "node:async_hooks", // Mark node:async_hooks as external to prevent browser compatibility issues
        "bullmq", // Server-only: BullMQ job queue
        "ioredis", // Server-only: Redis client
      ],
    },
  },
  optimizeDeps: {
    exclude: [
      "node:async_hooks", // Exclude node:async_hooks from optimization to fix build error
      "bullmq", // Server-only dependency
      "ioredis", // Server-only dependency
    ],
  },
  // https: {
  //   cert: "/etc/letsencrypt/live/decodeui.io/fullchain.pem",
  //   key: "/etc/letsencrypt/live/decodeui.io/privkey.pem",
  // },
});
