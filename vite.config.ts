import { resolve } from "node:path";
import { defineConfig } from "vite";
import { nitro } from "nitro/vite";
import { runtimeDir } from "nitro/meta";
import { solidStart } from "@solidjs/start/config";
import mkcert from "vite-plugin-mkcert";

// Must stay bundled in Nitro's Vite environment. If left external, Node loads
// `@solidjs/start/middleware` → `server-only` outside Vite's boundary stub.
const SERVER_NO_EXTERNAL = [
  "@solidjs/start",
  "h3",
  "cookie-es",
  "server-only",
] as const;

/** SolidStart APIs ride the SSR catch-all; register /api/** explicitly so Nitro
 *  doesn't treat `/api/...jpg` + `Sec-Fetch-Dest: image` as Vite static assets.
 *  @see https://github.com/nitrojs/nitro/issues/4252
 */
const nitroSsrRenderer = resolve(runtimeDir, "internal/vite/ssr-renderer");

export default defineConfig({
  plugins: [
    solidStart({
      middleware: "./src/middleware.ts",
    }),
    nitro(),
    mkcert(),
  ],
  resolve: {
    noExternal: [...SERVER_NO_EXTERNAL],
  },
  nitro: {
    serverDir: "./server",
    noExternals: [...SERVER_NO_EXTERNAL],
    // Keep pino worker transports as real CJS packages (not ESM-bundled).
    // Bundling breaks __dirname inside thread-stream / pino.transport.
    traceDeps: [
      "pino",
      "pino-pretty",
      "pino-roll",
      "thread-stream",
      "sonic-boom",
      "real-require",
    ],
    // node-worker HTTP-proxies to 127.0.0.1 and drops HTTP/2 :authority,
    // so request.url/Host become 127.0.0.1:<port>. self keeps the real host.
    devServer: {
      runner: "self",
    },
    handlers: [
      {
        route: "/api/**",
        handler: nitroSsrRenderer,
      },
    ],
    features: {
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
    https: true,
  },
  server: {
    // If set to true, the server is allowed to respond to requests for any hosts.
    allowedHosts: true,
    https: true,
  },
  build: {
    rollupOptions: {
      external: [
        "node:async_hooks", // Mark node:async_hooks as external to prevent browser compatibility issues
        "bullmq", // Server-only: BullMQ job queue
        "ioredis", // Server-only: Redis client
        "sharp", // Server-only: image optimization (libvips)
        // Pino transports/workers need real node_modules paths (__dirname); do not bundle
        "pino",
        "pino-pretty",
        "pino-roll",
        "thread-stream",
      ],
    },
  },
  optimizeDeps: {
    exclude: [
      "node:async_hooks", // Exclude node:async_hooks from optimization to fix build error
      "bullmq", // Server-only dependency
      "ioredis", // Server-only dependency
      "sharp", // Server-only dependency
      "pino",
      "pino-pretty",
      "pino-roll",
      "thread-stream",
    ],
  },
});
