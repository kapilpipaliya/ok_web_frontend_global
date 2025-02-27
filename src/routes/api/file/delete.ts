import type { APIEvent } from "@solidjs/start/server";

import { getQuery } from "vinxi/http";

import { getDBSessionForSubdomain } from "~/cypher/get/getSessionForSubdomain";
import { checkRole } from "~/cypher/permissions/checkPermission";
import { SYSTEM_ROLES } from "~/cypher/permissions/types";
import { APIError, handleAPIError } from "~/lib/api/apiErrorHandler";
import { getUserFromSession } from "~/server/auth/session/getUserFromSession";

import { deleteFile } from "./functions/deleteFile";

export async function DELETE({ request }: APIEvent) {
  const query = getQuery();
  const fileId = query.fileId;
  const { dbSession } = await getDBSessionForSubdomain(request);

  try {
    if (!fileId) {
      throw new APIError("File ID is required", 400);
    }

    const user = await getUserFromSession(request);

    if (!user) {
      throw new APIError("User not found", 404);
    }

    const isAdmin = await checkRole(request, SYSTEM_ROLES.ADMIN, dbSession, user);

    if (!isAdmin) {
      throw new APIError("Unauthorized. Admin access required.", 403);
    }

    return await deleteFile(fileId as string, dbSession, user);
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}
