import type { APIEvent } from "@solidjs/start/server";

import { getInitialData } from "~/cypher/get/getInitialData";
import { getDBSessionForSubdomain } from "~/cypher/get/getSessionForSubdomain";
import { handleAPIError } from "~/lib/api/apiErrorHandler";

export async function GET({ request }: APIEvent) {
  const { dbSession } = await getDBSessionForSubdomain(request);

  try {
    const data = await getInitialData(dbSession);
    return data;
  } catch (error: unknown) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}
