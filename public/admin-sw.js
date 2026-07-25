/* Admin-scoped service worker — network-first, no HTML caching. */
const CACHE_NAME = "admin-static-v4";
const PRECACHE = [
  "/admin-pwa/icon-192.png",
  "/admin-pwa/icon-512.png",
  "/admin-pwa/icon-512-maskable.png",
  "/admin-pwa/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  // Never cache navigations / HTML — keep admin pages fresh.
  if (
    request.mode === "navigate" ||
    (request.headers.get("accept") || "").includes("text/html")
  ) {
    event.respondWith(fetch(request));
    return;
  }

  // Dynamic manifest must stay network-only (subdomain-specific name).
  if (url.pathname === "/api/admin-pwa/manifest") {
    event.respondWith(fetch(request));
    return;
  }

  const isAdminAsset = url.pathname.startsWith("/admin-pwa/");
  const isBuildAsset = url.pathname.startsWith("/_build/");
  if (!isAdminAsset && !isBuildAsset) {
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok && isAdminAsset) {
          cache.put(request, networkResponse.clone());
        }
        return networkResponse;
      } catch {
        const cached = await cache.match(request);
        if (cached) {
          return cached;
        }
        throw new Error("Network error and no cache");
      }
    }),
  );
});
