import type { APIEvent } from "@solidjs/start/dist/server";

import { getDriver } from "~/cypher/driver";
import { mutateData } from "~/cypher/mutate/mutation_handlers/mutateData";
import { getSubDomain } from "~/server/getSubDomain";

export async function POST({ request }: APIEvent) {
  const data = await request.json();
  const subdomain = await getSubDomain(request.headers.get("host")!);
  const session = (await getDriver(subdomain)).session();
  // const session = await getSessionForSubdomain();
  const tx = session.beginTransaction();
  try {
    const res = await mutateData(data, tx);
    await tx.commit();
    return res;
  } catch (error: any) {
    await tx.rollback();
    return { error: "Transaction failed: " + error.message };
  } finally {
    await tx.close();
    await session.close();
  }
}
