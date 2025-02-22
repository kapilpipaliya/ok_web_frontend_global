import type { APIEvent } from "@solidjs/start/dist/server";

import { convertNodeToJson } from "~/cypher/convertNodeToJson";
import { processResult } from "~/cypher/get/evaluate/processResult";
import { getDBSessionForSubdomain } from "~/cypher/get/getSessionForSubdomain";
import { APIError, handleAPIError } from "~/lib/api/apiErrorHandler";
import { Edge, Vertex } from "~/lib/graph/graph";
import { checkAdminRole } from "~/server/session/checkAdminRole";

export async function GET({ request }: APIEvent) {
  const { dbSession } = await getDBSessionForSubdomain(request);

  try {
    const isAdmin = await checkAdminRole(request);
    if (!isAdmin) {
      throw new APIError("Unauthorized. Admin access required.", 403);
    }

    const nodes: { [key: string]: Vertex } = {};
    const relationships: { [key: string]: Edge } = {};

    const result = await dbSession.run(
      `MATCH (s:EmailSetting)
       RETURN s as settings`,
    );

    const settings = processResult(result.records, { nodes, relationships }, "settings", "");

    return {
      graph: {
        edges: relationships,
        vertexes: nodes,
      },
      result: settings,
      timestamp: new Date().getTime(),
    };
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}
