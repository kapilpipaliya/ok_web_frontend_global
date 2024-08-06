import type { APIEvent } from "@solidjs/start/server";

import { getRequestURL } from "vinxi/http";

import { getDriver } from "~/cypher/driver";
import { getSubDomain } from "~/server/getSubDomain";

export async function getSessionForSubdomain(request?: APIEvent["request"]) {
  const host = request ? request.headers.get("host")! : getRequestURL().hostname;
  if (!host) { throw new Error("Host header is missing"); }
  const subDomain = await getSubDomain(host);
  return (await getDriver(subDomain)).session();
}
