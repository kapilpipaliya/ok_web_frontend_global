import type { APIEvent } from "@solidjs/start/server";
import { getRequestEvent } from "solid-js/web";

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

export function getURL(request?: APIEvent["request"]): URL {
  if (request) {
    return new URL(request.url);
  }
  const event = getRequestEvent();
  if (!event?.request) {
    throw new Error("URL is missing");
  }
  return new URL(event.request.url);
}
