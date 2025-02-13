import type { APIEvent } from "@solidjs/start/server";

import { SYSTEM_DB_NAME } from "~/cypher/boltConstant";
import { getDBSessionForSubdomain } from "~/cypher/get/getSessionForSubdomain";
import { getSubDomainInfo } from "~/cypher/get/getSubDomainInfo";

// unused
export async function POST({ request }: APIEvent) {
  const { dbSession, subDomain } = await getDBSessionForSubdomain(request);

  if (subDomain === SYSTEM_DB_NAME) {
    await dbSession.close();
    return { success: true };
  }

  return await getSubDomainInfo(subDomain, dbSession);
}
