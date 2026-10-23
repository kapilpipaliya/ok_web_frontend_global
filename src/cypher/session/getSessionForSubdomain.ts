import type { APIEvent } from "@solidjs/start/server";
import { getRequestEvent } from "@solidjs/web";

import { getDriver } from "~/cypher/core/driver";
import { getSubDomain } from "~/cypher/session/getSubDomain";

/**
 * Resolves the Neo4j database name (and domain) for the current request hostname.
 */
export async function getSubdomainForRequest(request?: APIEvent["request"]) {
  const url = getURL(request);
  const subDomain = await getSubDomain(url.hostname);
  return {
    domain: subDomain.domain,
    subDomain: subDomain.subdomain,
  };
}

// TODO: This should not throw error, else its not captured by the API error handler and sent to the client, or either handle erroor in API Endpoints.
/**
 * Returns a Neo4j session for the current subdomain. Callers must always close
 * the session when done (e.g. in a finally block: await dbSession.close()).
 */
export async function getDBSessionForSubdomain(request?: APIEvent["request"]) {
  const { domain, subDomain } = await getSubdomainForRequest(request);
  const dbSession = (await getDriver()).session({
    database: subDomain,
  });
  return {
    dbSession,
    domain,
    subDomain,
  };
}

/**
 * Client-facing request URL.
 * Prefer x-forwarded-host / Host (production reverse proxies); fall back to
 * request.url (correct in-process with nitro `devServer.runner: "self"`).
 */
export function getURL(request?: APIEvent["request"]): URL {
  const req = request ?? getRequestEvent()?.request;
  if (!req) {
    throw new Error("URL is missing");
  }

  const url = new URL(req.url);

  return url;
}
