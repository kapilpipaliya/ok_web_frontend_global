import type { APIEvent } from "@solidjs/start/server";

import { ADMIN_SERVICE_WORKER_SOURCE } from "~/lib/pwa/adminServiceWorkerSource";

/**
 * Served from /api so SolidStart does not mangle dotted filenames into
 * broken paths like /admin-pwa/sw:.js (which made Chrome HTML-fallback
 * and only offer "Create shortcut").
 *
 * Service-Worker-Allowed lets this script control /admin.
 */
export async function GET(_event: APIEvent) {
  return new Response(ADMIN_SERVICE_WORKER_SOURCE, {
    status: 200,
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Service-Worker-Allowed": "/",
    },
  });
}
