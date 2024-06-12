import {getSubDomain} from "~/server/domain_utils";
import {getDriver} from "~/cypher/driver";
import { getRequestURL } from "vinxi/http";

export async function getSessionForSubdomain() {
  const host = getRequestURL().hostname;
  const subDomain = await getSubDomain(host);
  return (await getDriver(subDomain)).session();
}