import { redirect } from "@solidjs/router";
import { createMiddleware } from "@solidjs/start/middleware";
import { csrf } from "shieldwall/start";

import { checkRoutePermissionBase } from "./lib/permissions/checkRoutePermission";
import { logger } from "./lib/logger";
import {initializeWorkersIfNeeded} from "~/server/initWorkersOnStartup";

// Helper to check if logging should be skipped
const shouldSkipLogging = (pathname: string) => {
  return pathname.startsWith("/_build") ||
         pathname.startsWith("/assets") ||
         pathname === "/favicon.ico" ||
         pathname === "/health";
};

// https://docs.solidjs.com/solid-start/guides/security
// https://github.com/atilafassina/shieldwall
// Note: this authorization will not work in client side
export default createMiddleware({
  onRequest: [
    // Handle HEAD requests and log incoming requests
    async (event) => {
      if (typeof window !== "undefined") return;

      const isHeadRequest = event.request.method === "HEAD";

      // Convert HEAD to GET for processing
      if (isHeadRequest) {
        (event.locals as any).isHeadRequest = true;
        Object.defineProperty(event, 'request', {
          value: new Request(event.request.url, {
            method: "GET",
            headers: event.request.headers,
          }),
          writable: false,
          configurable: true
        });
      }

      const url = new URL(event.request.url);
      if (!shouldSkipLogging(url.pathname)) {
        (event.locals as any).requestStartTime = Date.now();

        logger.debug(
          {
            type: "http_request_start",
            method: isHeadRequest ? "HEAD" : event.request.method,
            url: url.pathname + url.search,
            userAgent: event.request.headers.get("user-agent") || undefined,
            ip: event.request.headers.get("x-forwarded-for") ||
                event.request.headers.get("x-real-ip") || undefined,
          },
          `→ ${isHeadRequest ? "HEAD" : event.request.method} ${url.pathname}`,
        );
      }
    },
    csrf,
    // Initialize workers on first request (server-side only)
    async (event) => {
      // Only run on server
      if (typeof window === "undefined") {
        await initializeWorkersIfNeeded();
      }
    },
    // temporary disable secureRequest
    // securityHeaders({
    //   csp: {
    //     dev: {
    //       value: {
    //         "connect-src": ["'self'", "ws://localhost:*", "https://api.iconify.design", "https://api.unisvg.com", "https://api.simplesvg.com"],
    //       }
    //     }
    //   }
    // }),
    // securityHeaders({
    //   referrerPolicy: "no-referrer", // Allows all iframes by not sending referrer information
    //   xFrameOptions: "SAMEORIGIN", // Allows iframes from the same origin
    // }),
    async (event) => {
      // Allow _server paths without permission check
      const url = new URL(event.request.url);
      if (url.pathname === "/_server") {
        return;
      }

      const permissionResult = await checkRoutePermissionBase(event.request);

      // If the user doesn't have permission, redirect to the appropriate page
      if (!permissionResult.hasPermission && permissionResult.redirectUrl) {
        return redirect(permissionResult.redirectUrl);
      }
    },
  ],
  onBeforeResponse: [
    async (event) => {
      if (typeof window !== "undefined") return;

      // Strip body from HEAD requests
      if ((event.locals as any).isHeadRequest && event.response) {
        Object.defineProperty(event, 'response', {
          value: new Response(null, {
            status: event.response.status,
            statusText: event.response.statusText,
            headers: event.response.headers,
          }),
          writable: false,
          configurable: true
        });
      }

      // Log response
      const url = new URL(event.request.url);
      if (!shouldSkipLogging(url.pathname)) {
        const startTime = (event.locals as any).requestStartTime;
        const duration = startTime ? Date.now() - startTime : undefined;

        logger.logRequest({
          method: (event.locals as any).isHeadRequest ? "HEAD" : event.request.method,
          url: url.pathname + url.search,
          statusCode: event.response?.status || 200,
          duration,
          userAgent: event.request.headers.get("user-agent") || undefined,
          ip: event.request.headers.get("x-forwarded-for") ||
              event.request.headers.get("x-real-ip") || undefined,
        });
      }
    },
  ],
});
