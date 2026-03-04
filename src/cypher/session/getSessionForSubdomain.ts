import type { APIEvent } from "@solidjs/start/server";

import { getRequestURL } from "vinxi/http";

import { getDriver } from "~/cypher/core/driver";
import { getSubDomain } from "~/cypher/session/getSubDomain";

// TODO: This should not throw error, else its not captured by the API error handler and sent to the client, or either handle erroor in API Endpoints.
/**
 * Returns a Neo4j session for the current subdomain. Callers must always close
 * the session when done (e.g. in a finally block: await dbSession.close()).
 */
export async function getDBSessionForSubdomain(request?: APIEvent["request"]) {
  const url = getURL(request);
  const subDomain = await getSubDomain(url.hostname);
  const dbSession = (await getDriver()).session({
    database: subDomain.subdomain,
  });
  return {
    dbSession,
    domain: subDomain.domain,
    subDomain: subDomain.subdomain,
  };
}

export function getURL(request?: APIEvent["request"]): URL {
  const url = request ? new URL(request.url) : getRequestURL();
  if (!url) {
    throw new Error("URL is missing");
  }
  return url;
}
