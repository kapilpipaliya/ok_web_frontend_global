import type {APIEvent} from "@solidjs/start/server";

import {getDriver} from "~/cypher/driver";
import {getSubDomainInfo} from "~/routes/api/getSubDomainInfo";
import {getSubDomain} from "~/server/getSubDomain";

export async function POST({ request }: APIEvent) {
  const subdomain = await getSubDomain(request.headers.get("host")!);
  const session = (await getDriver(subdomain)).session();

  if (subdomain === "super") {
    await session.close();
    return { success: true};
  }

  return await getSubDomainInfo(subdomain, session);
}
