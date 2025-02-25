import type { APIEvent } from "@solidjs/start/server";

import { getDBSessionForSubdomain } from "~/cypher/get/getSessionForSubdomain";
import { checkRole } from "~/cypher/permissions/checkPermission";
import { SYSTEM_ROLES } from "~/cypher/permissions/types";
import { APIError, handleAPIError } from "~/lib/api/apiErrorHandler";
import { getUserFromSession } from "~/server/auth/session/getUserFromSession";

export async function DELETE({ request }: APIEvent) {
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

    const { themeId } = await request.json();

    if (!themeId) {
      throw new APIError("Theme ID is required", 400);
    }

    // Check if theme exists and is not currently selected
    const result = await dbSession.run(
      `MATCH (t:Theme)
       WHERE elementId(t) = $themeId
       AND NOT EXISTS((:GlobalSetting)-[:GlobalSettingTheme]->(t))
       DELETE t
       RETURN count(t) as deleted`,
      { themeId },
    );

    const deletedCount = result.records[0]?.get("deleted") || 0;

    if (deletedCount === 0) {
      throw new APIError("Theme not found or is currently selected", 404);
    }

    return {
      graph: {
        deleted_vertexes: [themeId],
      },
      success: true,
    };
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}
