import { redirect } from "@solidjs/router";
import { createMiddleware } from "@solidjs/start/middleware";
import { csrf } from "shieldwall/start";

import { checkRoutePermission } from "./lib/permissions/checkRoutePermission";

// https://docs.solidjs.com/solid-start/guides/security
// https://github.com/atilafassina/shieldwall
// Note: this authorization will not work in client side
export default createMiddleware({
  onRequest: [
    csrf,
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
    async (event) => {
      const permissionResult = await checkRoutePermission(event.request);

      // If the user doesn't have permission, redirect to the appropriate page
      if (!permissionResult.hasPermission && permissionResult.redirectUrl) {
        return redirect(permissionResult.redirectUrl);
      }
    },
  ],
});
