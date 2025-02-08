import tld from "tldts";

import { SYSTEM_DB_NAME } from "~/cypher/boltConstant";

export async function getSubDomain(host: string) {
  const { subdomain } = tld.parse(host);

  if (!subdomain || subdomain === "www") {
    return SYSTEM_DB_NAME;
  }

  return subdomain;
}
