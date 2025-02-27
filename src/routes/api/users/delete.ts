import type { APIEvent } from "@solidjs/start/server";

import { convertNodeToJson } from "~/cypher/conversion/convertNodeToJson";
import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import { createActivityLog } from "~/cypher/mutate/activity/createActivityLog";
import { checkRole } from "~/cypher/permissions/checkPermission";
import { SYSTEM_ROLES } from "~/cypher/permissions/types";
import { APIError } from "~/lib/api/apiErrorHandler";
import { handleAPIError } from "~/lib/api/apiErrorHandler";
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

    const { id } = await request.json();

    // Prevent self-deletion
    if (id === user?.id) {
      throw new APIError("Cannot delete your own account", 400);
    }

    // Check if user exists
    const userCheck = await dbSession.run(
      `
      MATCH (u:User)
      WHERE elementId(u) = $id
      RETURN u
    `,
      { id },
    );

    if (userCheck.records.length === 0) {
      throw new APIError("User not found", 404);
    }

    const deletedUser = convertNodeToJson(userCheck.records[0].get("u"));

    // Delete user and all relationships
    await dbSession.run(
      `
      MATCH (u:User)
      WHERE elementId(u) = $id
      OPTIONAL MATCH (u)-[r]-()
      DELETE u, r
    `,
      { id },
    );

    // Log the user deletion
    await createActivityLog(
      dbSession,
      "user_delete",
      "User",
      deletedUser.P.uuid,
      user.P.email,
      `Deleted user: ${deletedUser.P.name} (${deletedUser.P.email})`,
    );

    return {
      graph: {
        deleted_vertexes: [id],
      },
      success: true,
    };
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}
