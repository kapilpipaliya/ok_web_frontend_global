import type { APIEvent } from "@solidjs/start/server";

import type { Edge, Vertex } from "~/lib/graph/graph";

import { checkRole } from "~/cypher/permissions/checkPermission";
import { SYSTEM_ROLES } from "~/cypher/permissions/types";
import { processResult } from "~/cypher/queries/evaluate/processResult";
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

    if (!user?.P?.email) {
      throw new Error("Unauthorized");
    }

    const nodes: { [key: string]: Vertex } = {};
    const relationships: { [key: string]: Edge } = {};

    const result = await dbSession.run(`
      MATCH (r:Role)
      RETURN r
      ORDER BY r.name ASC
    `);

    const roles = processResult(
      result.records,
      { nodes, relationships },
      "r",
      "",
    );

    return {
      graph: {
        edges: relationships,
        vertexes: nodes,
      },
      result: roles,
      timestamp: new Date().getTime(),
    };
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}
