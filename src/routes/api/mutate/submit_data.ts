import type { APIEvent } from "@solidjs/start/dist/server";

import { getDBSessionForSubdomain } from "~/cypher/get/getSessionForSubdomain";
import { mutateData } from "~/cypher/mutate/mutation_handlers/mutateData";

import { handleError } from "../../../lib/handleError";
import { checkSuperUserAuthorization } from "../../../server/checkSuperUserAuthorization";

export async function POST({ request }: APIEvent) {
  const data = await request.json();
  const { dbSession, subDomain } = await getDBSessionForSubdomain(request);
  const tx = dbSession.beginTransaction();
  try {
    // - Authorization -
    const authorizationError = await checkSuperUserAuthorization(subDomain, dbSession);
    if (authorizationError) {
      return authorizationError;
    }
    // - End of Authorization -

    const res = await mutateData(data, tx);
    await tx.commit();
    return res;
  } catch (error: unknown) {
    await tx.rollback();
    return await handleError("Transaction failed:", error);
  } finally {
    await tx.close();
    await dbSession.close();
  }
}
