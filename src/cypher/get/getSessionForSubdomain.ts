import { getRequestURL } from "vinxi/http";

import {getDriver} from "~/cypher/driver";
import {getSubDomain} from "~/server/getSubDomain";

export async function getSessionForSubdomain() {
  const host = getRequestURL().hostname;
  const subDomain = await getSubDomain(host);
  return (await getDriver(subDomain)).session();
}