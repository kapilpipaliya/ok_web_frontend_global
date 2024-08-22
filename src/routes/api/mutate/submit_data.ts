import type { APIEvent } from "@solidjs/start/dist/server";

import { getDBSessionForSubdomain } from "~/cypher/get/getSessionForSubdomain";
import { mutateData } from "~/cypher/mutate/mutation_handlers/mutateData";

import { handleError } from "../../../lib/handleError";
import { checkSuperUserAuthorization } from "../../../server/checkSuperUserAuthorization";

export async function POST({ request }: APIEvent) {
  let data;
  if (request.headers.get("content-type")?.includes("application/json")) {
    data = await request.json();
  } else {
    return new Response(
      JSON.stringify({
        error: "Invalid content type. Expected application/json",
      }),
      { status: 415 }
    );
  }

  const { dbSession, subDomain } = await getDBSessionForSubdomain(request);
  const tx = dbSession.beginTransaction();
  try {
    // - Authorization -
    const authorizationError = await checkSuperUserAuthorization(subDomain, dbSession, true);
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
