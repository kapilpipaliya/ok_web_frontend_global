import { createMiddleware } from "@solidjs/start/middleware";
import { getHttpsSession } from "~/cypher/server/auth/getHttpsSession";
import { redirect } from "@solidjs/router";
export default createMiddleware({
  onRequest: [
    async (event) => {
      const url = new URL(event.request.url);

      // Check if the request URL path is in the list of public paths
      if (url.pathname.includes("/admin")) {
        const httpSession = await getHttpsSession();
        if (!httpSession.data?.email) {
          // Redirect to the login page if not authorized
          return redirect("/not-authorized");
        }
      }
    },
  ],
});
