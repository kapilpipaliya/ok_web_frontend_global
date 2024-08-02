import type { APIEvent } from "@solidjs/start/dist/server";

import { getSessionForSubdomain } from "~/cypher/get/getSessionForSubdomain";
import { mutateData } from "~/cypher/mutate/mutation_handlers/mutateData";

export async function POST({ request }: APIEvent) {
  const data = await request.json();
  const session = await getSessionForSubdomain(request);
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
