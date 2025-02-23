import type { APIEvent } from "@solidjs/start/dist/server";

import { SYSTEM_DB_NAME } from "~/cypher/boltConstant";
import { processResult } from "~/cypher/get/evaluate/processResult";
import { getDBSessionForSubdomain } from "~/cypher/get/getSessionForSubdomain";
import { APIError, handleAPIError } from "~/lib/api/apiErrorHandler";
import { Edge, Vertex } from "~/lib/graph/graph";
import { checkAdminRole } from "~/server/session/checkAdminRole";
import { getUserFromSession } from "~/server/session/getUserFromSession";


export async function GET({ request }: APIEvent) {
  const { dbSession, subDomain } = await getDBSessionForSubdomain(request);

  try {
    const isAdmin = await checkAdminRole(request);
    if (!isAdmin) {
      throw new APIError("Unauthorized. Admin access required.", 403);
    }

    const nodes: { [key: string]: Vertex } = {};
    const relationships: { [key: string]: Edge } = {};

    let result;
    if (subDomain === SYSTEM_DB_NAME) {
      // Get account-specific email settings
      const user = await getUserFromSession(request);
      result = await dbSession.run(
        `MATCH (a:Account)-[:AccountUser]->(u:User {uuid: $uuid})
         MATCH (a)-[:AccountEmailSetting]->(s:EmailSetting)
         RETURN s as settings`,
        { uuid: user?.P.uuid }
      );
    } else {
      // Get subdomain email settings
      result = await dbSession.run(
        `MATCH (s:EmailSetting)
         RETURN s as settings`
      );
    }

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
