import { defineConfig } from "@solidjs/start/config";
import mkcert from "vite-plugin-mkcert";
// import devtools from 'solid-devtools/vite';

export default defineConfig({
  middleware: "./src/middleware.ts",
  // server: {
  //   preset: "deno",
  // },
  server: {
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
  vite: {
    server: {
      //  If set to true, the server is allowed to respond to requests for any hosts.
      allowedHosts: true,
      // https: true,
    },
    build: {
      rollupOptions: {
        external: [
          "node:async_hooks", // Mark node:async_hooks as external to prevent browser compatibility issues
          "bullmq", // Server-only: BullMQ job queue
          "ioredis", // Server-only: Redis client
          "sharp", // Server-only: image optimization (libvips)
        ],
      },
    },
    optimizeDeps: {
      exclude: [
        "node:async_hooks", // Exclude node:async_hooks from optimization to fix build error
        "bullmq", // Server-only dependency
        "ioredis", // Server-only dependency
        "sharp", // Server-only dependency
      ],
    },
    // dev: {
    //   force: false,
    //   https: false,
    //   port: 3001,
    //   devtools: true,
    //   ws: {
    //     port: 1100
    //   }
    // },
    // },
    // server: {
    // https: {
    // cert: "/etc/letsencrypt/live/decodeui.io/fullchain.pem",
    // key: "/etc/letsencrypt/live/decodeui.io/privkey.pem",
    // },
    // port: 36075, // Change this to the desired port number for the server
    // hmr: {
    //   protocol: "wss",
    //   port: 2900, // Change this to the desired port number for HMR
    // },
    // },
    plugins: [
      // mkcert(),
      // monaco-editor gives error in devtools
      // devtools({
      //   /* features options - all disabled by default */
      //   autoname: true,
      // }),
    ],
  },
}).addRouter({
  name: "ws",
  type: "http",
  handler: "./src/ws.ts",
  target: "server",
  base: "/ws",
});
