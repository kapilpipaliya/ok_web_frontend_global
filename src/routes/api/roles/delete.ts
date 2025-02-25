import type { APIEvent } from "@solidjs/start/server";

import { getDBSessionForSubdomain } from "~/cypher/get/getSessionForSubdomain";
import { APIError } from "~/lib/api/apiErrorHandler";
import { handleAPIError } from "~/lib/api/apiErrorHandler";
import { SYSTEM_ROLES } from "~/cypher/permissions/types";
import { getUserFromSession } from "~/server/auth/session/getUserFromSession";

export async function DELETE({ request }: APIEvent) {
  const { dbSession } = await getDBSessionForSubdomain(request);

  try {
    const _user = await getUserFromSession(request);
    // const [graph] = useGraph();

    // if (!(user?.P?.email && isAdminRole(graph))) {
    //   throw new APIError("Unauthorized", 401);
    // }

    const { id } = await request.json();

    // Check if role exists and is not in use
    const roleCheck = await dbSession.run(
      `
      MATCH (r:Role)
      WHERE elementId(r) = $id
      OPTIONAL MATCH (u:User)-[:UserRole]->(r)
      RETURN r, count(u) as userCount, r.key as roleName
    `,
      { id },
    );

    if (roleCheck.records.length === 0) {
      throw new APIError("Role not found", 404);
    }

    const roleName = roleCheck.records[0].get("roleName");
    if (Object.values(SYSTEM_ROLES).includes(roleName)) {
      throw new APIError("Cannot delete system role.", 403);
    }

    const userCount = roleCheck.records[0].get("userCount");
    if (userCount > 0) {
      throw new APIError("Cannot delete role that is assigned to users", 400);
    }

    // Delete the role
    await dbSession.run(
      `
      MATCH (r:Role)
      WHERE elementId(r) = $id
      DELETE r
    `,
      { id },
    );
    return {
      graph: {
        deleted_vertexes: [roleCheck.records[0].get("r").identity],
      },
      success: true,
    };
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}
