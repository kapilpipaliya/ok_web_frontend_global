import { redirect } from "@solidjs/router";
import { createMiddleware } from "@solidjs/start/middleware";

import { generate401RedirectUrl } from "./lib/api/endpoints";
import { getUserFromSession } from "./server/session/getUserFromSession";

export default createMiddleware({
  onRequest: [
    async (event) => {
      const url = new URL(event.request.url);

      // Check if the request URL path is in the list of public paths
      if (url.pathname.includes("/admin")) {
        const sessionUser = await getUserFromSession(event.request);

        if (!sessionUser) {
          // Redirect to the login page if not authorized
          return redirect(generate401RedirectUrl(url.pathname));
        }
      }
    },
  ],
});
