import { createMiddleware } from "@solidjs/start/middleware";
import { getHttpsSession } from "./cypher_api/server/auth/getHttpsSession";
import { redirect } from "@solidjs/router";

export default createMiddleware({
    onRequest: [
        async (event) => {
            const url = new URL(event.request.url);
            // List of paths that do not require authentication
            const publicPaths = [
                "/auth/login",
                 "/auth/signup",'/'
                ];
            console.log(url.pathname);
                
            // event.request.headers.get("content-type") === 'application/json'
            // Check if the request URL path is in the list of public paths
            if (!publicPaths.includes(url.pathname)) {
                const httpSession = await getHttpsSession();
                if (!httpSession.data?.email) {
                    
                    // Redirect to the login page if not authorized
                    throw new Response(null, {
                        status: 302,
                        headers: {
                            "Location": `${url.hostname}/auth/login`
                        }
                    });
                }
            }
        }
    ]
});
