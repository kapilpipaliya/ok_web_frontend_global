import type { APIEvent } from "@solidjs/start/dist/server";

import { convertNodeToJson } from "~/cypher/convertNodeToJson";
import { getDBSessionForSubdomain } from "~/cypher/get/getSessionForSubdomain";
import { APIError, handleAPIError } from "~/lib/api/apiErrorHandler";
import { checkAdminRole } from "~/server/session/checkAdminRole";

export async function GET({ request }: APIEvent) {
  const { dbSession } = await getDBSessionForSubdomain(request);

  try {
    const isAdmin = await checkAdminRole(request);

    if (!isAdmin) {
      throw new APIError("Unauthorized. Admin access required.", 403);
    }
    const result = await dbSession.run(
      `MATCH (s:CompanySetting)
       RETURN s as settings`,
    );

    const node = result.records[0]?.get("settings");
    const settings = node ? convertNodeToJson(node) : null;

    return { settings };
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}
