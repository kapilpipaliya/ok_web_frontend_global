import { Link, Meta } from "@solidjs/meta";
import { createMemo, onSettled } from "solid-js";
import { getRequestEvent, isServer } from "@solidjs/web";
import { parse } from "tldts";

import { adminPwaAppName } from "~/lib/pwa/buildAdminPwaManifest";

const MANIFEST_HREF = "/api/admin-pwa/manifest";
/** Static file — SolidStart mangles dotted route filenames into broken paths. */
const SW_URL = "/admin-sw.js";
/** Covers /admin and /admin/*; requires Service-Worker-Allowed: / on sw */
const SW_SCOPE = "/admin";

function hostSubdomainLabel(hostname: string): string {
  if (!hostname || hostname === "localhost" || hostname === "127.0.0.1") {
    return "admin";
  }
  const { subdomain } = parse(hostname);
  if (subdomain) {
    // tldts may return "www.foo" for nested hosts; use the leftmost label
    return subdomain.split(".")[0] || "admin";
  }
  return hostname.split(".")[0] || "admin";
}

function currentSubdomainLabel(): string {
  if (isServer) {
    const host =
      getRequestEvent()?.request.headers.get("host")?.split(":")[0] ??
      "localhost";
    return hostSubdomainLabel(host);
  }
  return hostSubdomainLabel(window.location.hostname);
}

/**
 * Registers admin-scoped PWA assets (manifest + service worker).
 * Mount once from each admin layout shell.
 */
export function AdminPwa() {
  const appTitle = createMemo(() => adminPwaAppName(currentSubdomainLabel()));

  onSettled(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    void (async () => {
      try {
        const registration = await navigator.serviceWorker.register(SW_URL, {
          scope: SW_SCOPE,
          updateViaCache: "none",
        });
        await registration.update();
        await navigator.serviceWorker.ready;
      } catch (error) {
        console.warn("[AdminPwa] service worker registration failed:", error);
      }
    })();
  });

  return (
    <>
      <Link href={MANIFEST_HREF} rel="manifest" />
      <Link href="/admin-pwa/apple-touch-icon.png" rel="apple-touch-icon" />
      <Meta content="#0f172a" name="theme-color" />
      <Meta content="yes" name="mobile-web-app-capable" />
      <Meta content="default" name="apple-mobile-web-app-status-bar-style" />
      <Meta content={appTitle()} name="apple-mobile-web-app-title" />
    </>
  );
}
