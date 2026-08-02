import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

/**
 * SolidStart API routes are served through Nitro's SSR catch-all (`/**`), not as
 * explicit Nitro handlers. Nitro's Vite pre-middleware then treats
 * `Sec-Fetch-Dest: image` (and URLs ending in `.jpg`/etc.) as static assets and
 * hands them to Vite, which responds `Cannot GET /api/...` — so <img src="/api/file/...">
 * 404s while opening the same URL in a new tab (Sec-Fetch-Dest: document) works.
 *
 * Force every `/api/*` request through Nitro before the asset heuristic runs.
 * @see https://github.com/nitrojs/nitro/issues/4252
 * @see https://github.com/nitrojs/nitro/pull/4272
 */
const require = createRequire(import.meta.url);

try {
  const nitroPkg = require.resolve("nitro/package.json");
  const target = join(dirname(nitroPkg), "dist/_build/vite.dev.mjs");

  if (!existsSync(target)) {
    console.warn("[patch] nitro vite.dev.mjs missing; skipped");
    process.exit(0);
  }

  const src = readFileSync(target, "utf8");
  const marker =
    "SolidStart API routes are served via the SSR catch-all";

  if (src.includes(marker)) {
    console.log("[patch] nitro vite.dev /api routing already applied");
    process.exit(0);
  }

  const from = `	server.middlewares.use(function nitroDevMiddlewarePre(req, res, next) {
		if (/^\\/(?:__|@)/.test(req.url)) return next();
		const match = nitro.routing.routes.match(req.method || "", new URL(withBase(req.url, nitro.options.baseURL), "http://localhost").pathname);`;

  const to = `	server.middlewares.use(function nitroDevMiddlewarePre(req, res, next) {
		if (/^\\/(?:__|@)/.test(req.url)) return next();
		// ${marker}, so Sec-Fetch-Dest / asset-extension heuristics must not divert /api/* to Vite (nitrojs/nitro#4252).
		const apiPathname = new URL(withBase(req.url, nitro.options.baseURL), "http://localhost").pathname;
		if (apiPathname === "/api" || apiPathname.startsWith("/api/")) return nitroDevMiddleware(req, res, next);
		const match = nitro.routing.routes.match(req.method || "", apiPathname);`;

  if (!src.includes(from)) {
    console.warn("[patch] nitro vite.dev /api pattern not found; skipped");
    process.exit(0);
  }

  writeFileSync(target, src.replace(from, to));
  console.log("[patch] nitro vite.dev /api routes forced through Nitro");
} catch (error) {
  console.warn("[patch] nitro vite.dev /api patch skipped:", error.message);
}
