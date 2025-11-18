import { redirect } from "@solidjs/router";
import { createMiddleware } from "@solidjs/start/middleware";
import { csrf } from "shieldwall/start";

import { checkRoutePermissionBase } from "./lib/permissions/checkRoutePermission";
import { logger } from "./lib/logger";
import {initializeWorkersIfNeeded} from "~/server/initWorkersOnStartup";

// https://docs.solidjs.com/solid-start/guides/security
// https://github.com/atilafassina/shieldwall
// Note: this authorization will not work in client side
export default createMiddleware({
  onRequest: [
    // Log incoming requests
    async (event) => {
      // Only log on server
      if (typeof window !== "undefined") return;

      const url = new URL(event.request.url);
      const startTime = Date.now();

      // Store start time for response logging
      (event.locals as any).requestStartTime = startTime;

      // Skip logging for static assets and health checks
      if (
        url.pathname.startsWith("/_build") ||
        url.pathname.startsWith("/assets") ||
        url.pathname === "/favicon.ico" ||
        url.pathname === "/health"
      ) {
        return;
      }

      // Log the incoming request
      logger.debug(
        {
          type: "http_request_start",
          method: event.request.method,
          url: url.pathname + url.search,
          userAgent: event.request.headers.get("user-agent") || undefined,
          ip:
            event.request.headers.get("x-forwarded-for") ||
            event.request.headers.get("x-real-ip") ||
            undefined,
        },
        `→ ${event.request.method} ${url.pathname}`,
      );
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
      // Only log on server
      if (typeof window !== "undefined") return;

      const url = new URL(event.request.url);
      const startTime = (event.locals as any).requestStartTime;

      // Skip logging for static assets and health checks
      if (
        url.pathname.startsWith("/_build") ||
        url.pathname.startsWith("/assets") ||
        url.pathname === "/favicon.ico" ||
        url.pathname === "/health"
      ) {
        return;
      }

      const duration = startTime ? Date.now() - startTime : undefined;

      // Determine status code (default to 200 if not set)
      const statusCode = event.response?.status || 200;

      // Log the response
      logger.logRequest({
        method: event.request.method,
        url: url.pathname + url.search,
        statusCode,
        duration,
        userAgent: event.request.headers.get("user-agent") || undefined,
        ip:
          event.request.headers.get("x-forwarded-for") ||
          event.request.headers.get("x-real-ip") ||
          undefined,
      });
    },
  ],
});
