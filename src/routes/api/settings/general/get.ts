import type { APIEvent } from "@solidjs/start/server";

import { convertNodeToJson } from "~/cypher/convertNodeToJson";
import { getDBSessionForSubdomain } from "~/cypher/get/getSessionForSubdomain";
import { APIError, handleAPIError } from "~/lib/api/apiErrorHandler";
import { checkAdminRole } from "~/server/auth/permissions/checkAdminRole";

export async function GET({ request }: APIEvent) {
  const { dbSession } = await getDBSessionForSubdomain(request);

  try {
    const isAdmin = await checkAdminRole(request);

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
