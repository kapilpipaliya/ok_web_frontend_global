import { redirect } from "@solidjs/router";
import { createMiddleware } from "@solidjs/start/middleware";

import { SYSTEM_DB_NAME } from "./cypher/boltConstant";
import { generate401RedirectUrl } from "./lib/api/endpoints";
import { getSubDomain } from "./server/session/getSubDomain";
import { getUserFromSession } from "./server/session/getUserFromSession";

export default createMiddleware({
  onRequest: [
    async (event) => {
      const url = new URL(event.request.url);
      const sessionUser = await getUserFromSession(event.request);
      const subdomain = await getSubDomain(event.request.headers.get("host")!);
      const isSuperSubDomain = subdomain === SYSTEM_DB_NAME;

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
