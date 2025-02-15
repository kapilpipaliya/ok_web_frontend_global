import { redirect } from "@solidjs/router";
import { createMiddleware } from "@solidjs/start/middleware";

import { getHttpsSession } from "~/server/session/getHttpsSession";

import { getDBSessionForSubdomain } from "./cypher/get/getSessionForSubdomain";
import { generate401RedirectUrl } from "./lib/api/endpoints";
import { Vertex } from "./lib/graph/graph";

export default createMiddleware({
  onRequest: [
    async (event) => {
      const url = new URL(event.request.url);

      // Check if the request URL path is in the list of public paths
      if (url.pathname.includes("/admin")) {
        const httpSession = await getHttpsSession();
        const sessionUser = httpSession.data?.user as Vertex;

        if (!sessionUser) {
          // Redirect to the login page if not authorized
          return redirect(generate401RedirectUrl(url.pathname));
        }

        const {dbSession} = await getDBSessionForSubdomain(event.request);
        const query = `MATCH (u:User) where elementId(u) = $id RETURN u.password as password`;
        const result = await dbSession.run(query, { id: sessionUser.id });
        const userPasswordFromDb = result.records[0]?.get("password");

        if (!userPasswordFromDb || userPasswordFromDb !== sessionUser.P.password) {
          // Redirect if passwords do not match
          return redirect(generate401RedirectUrl(url.pathname));
        }
      }
    },
  ],
});
