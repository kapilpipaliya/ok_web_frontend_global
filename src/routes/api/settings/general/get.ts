import type { APIEvent } from "@solidjs/start/server";

import { convertNodeToJson } from "~/cypher/conversion/convertNodeToJson";
import { checkRole } from "~/cypher/permissions/checkPermission";
import { SYSTEM_ROLES } from "~/cypher/permissions/types";
import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import { APIError, handleAPIError } from "~/lib/api/apiErrorHandler";
import { getUserFromSession } from "~/server/auth/session/getUserFromSession";

export async function GET({ request }: APIEvent) {
  const { dbSession } = await getDBSessionForSubdomain(request);

  try {
    const user = await getUserFromSession(request);

    if (!user) {
      throw new APIError("User not found", 404);
    }

    const isAdmin = await checkRole(
      request,
      SYSTEM_ROLES.ADMIN,
      dbSession,
      user,
    );

    if (!isAdmin) {
      throw new APIError("Unauthorized. Admin access required.", 403);
    }

    const result = await dbSession.run(
      `MATCH (s:GlobalSetting)
       OPTIONAL MATCH (s)-[:CompanyLogo]->(logo:File)
       RETURN s as settings, logo as companyLogo`,
    );

    const node = result.records[0]?.get("settings");
    const logoNode = result.records[0]?.get("companyLogo");
    const settings = node ? convertNodeToJson(node) : null;
    const companyLogo = logoNode ? convertNodeToJson(logoNode) : null;

    return { companyLogo, settings };
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}
