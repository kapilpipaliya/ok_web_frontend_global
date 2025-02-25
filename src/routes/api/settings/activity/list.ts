import type { APIEvent } from "@solidjs/start/server";

import type { Edge } from "~/lib/graph/graph";
import type { Vertex } from "~/lib/graph/graph";

import { convertNodeToJson } from "~/cypher/convertNodeToJson";
import { getDBSessionForSubdomain } from "~/cypher/get/getSessionForSubdomain";
import { checkRole } from "~/cypher/permissions/checkPermission";
import { SYSTEM_ROLES } from "~/cypher/permissions/types";
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

    const nodes: { [key: string]: Vertex } = {};
    const relationships: { [key: string]: Edge } = {};

    // Get activity logs ordered by creation date
    const result = await dbSession.run(
      `MATCH (a:ActivityLog)
       RETURN {
         action: a.action,
         createdAt: toString(a.createdAt),
         description: a.description,
         entityId: a.entityId,
         entityType: a.entityType,
         user: a.user
       } as log
       ORDER BY a.createdAt DESC
       LIMIT 100`,
    );

    const logs = result.records.map((record) =>
      convertNodeToJson(record.get("log")),
    );

    return {
      graph: {
        edges: relationships,
        vertexes: nodes,
      },
      result: logs,
      timestamp: new Date().getTime(),
    };
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}
