import type { APIEvent } from "@solidjs/start/server";

import { checkRole } from "~/cypher/permissions/isPermission";
import { SYSTEM_ROLES } from "~/cypher/permissions/type/types";
import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import { APIError, handleAPIError } from "~/lib/api/server/apiErrorHandler";
import { getUserFromSession } from "~/server/auth/session/getUserFromSession";

import { replaceFiles } from "./functions/replaceFiles";

export async function PUT(event: APIEvent) {
  const { request, nativeEvent } = event;
  const { dbSession, subDomain } = await getDBSessionForSubdomain(request);

  try {
    const user = await getUserFromSession(request);

    if (!user) {
      throw new APIError("User not found", 404);
    }

    const isAdmin = await checkRole(SYSTEM_ROLES.ADMIN, dbSession, user);

    if (!isAdmin) {
      throw new APIError("Unauthorized. Admin access required.", 403);
    }

    const formData = await nativeEvent.req.formData();

    if ([...formData.keys()].length === 0) {
      throw new APIError("No file data available", 400);
    }
    return await replaceFiles(request, formData, dbSession, subDomain, user);
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}
