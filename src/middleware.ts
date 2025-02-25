import { redirect } from "@solidjs/router";
import { createMiddleware } from "@solidjs/start/middleware";
// @ts-expect-error shieldwall is not typed
import { csrfProtection } from "shieldwall/start";

import { getSubDomain } from "~/cypher/get/getSubDomain";
import { getUserFromSession } from "~/server/auth/session/getUserFromSession";

import { SYSTEM_DB_NAME } from "./cypher/boltConstant";
import { generate401RedirectUrl } from "./lib/api/endpoints";

// https://docs.solidjs.com/solid-start/guides/security
// https://github.com/atilafassina/shieldwall
export default createMiddleware({
  onRequest: [
    csrfProtection,
    // temporary disable secureRequest
    // secureRequest({
    //   csp: {
    //     dev: {
    //       value: {
    //         "connect-src": ["'self'", "ws://localhost:*", "https://api.iconify.design", "https://api.unisvg.com", "https://api.simplesvg.com"],
    //       }
    //     }
    //   }
    // }),
    async (event) => {
      const url = new URL(event.request.url);
      if (url.pathname === "/api/mutate/superUserSetup") {
        return;
      }
      const subdomain = await getSubDomain(event.request.headers.get("host")!);
      const isSuperSubDomain = subdomain === SYSTEM_DB_NAME;
      const sessionUser = await getUserFromSession(event.request);

      // Check if the request URL path is in the list of public paths
      if (url.pathname.includes("/system")) {
        if (!(isSuperSubDomain && sessionUser)) {
          // Redirect to the login page if not authorized
          return redirect(generate401RedirectUrl(url.pathname));
        }
      } else if (url.pathname.includes("/admin")) {
        if (isSuperSubDomain || !sessionUser) {
          // Redirect to the login page if not authorized
          return redirect(generate401RedirectUrl(url.pathname));
        }
      }
    },
  ],
});
