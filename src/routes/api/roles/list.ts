import type { APIEvent } from "@solidjs/start/server";

import { convertNodeToJson } from "~/cypher/convertNodeToJson";
import { processResult } from "~/cypher/get/evaluate/processResult";
import { getDBSessionForSubdomain } from "~/cypher/get/getSessionForSubdomain";
import { handleAPIError } from "~/lib/api/apiErrorHandler";
import type { Edge } from "~/lib/graph/graph";
import type { Vertex } from "~/lib/graph/graph";
import { getUserFromSession } from "~/server/session/getUserFromSession";

export async function GET({ request }: APIEvent) {
  const { dbSession } = await getDBSessionForSubdomain(request);

  try {
    const user = await getUserFromSession(request);
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

    processResult(result.records, { nodes, relationships }, "r", "");

    const roles = result.records.map((record) =>
      convertNodeToJson(record.get("r")),
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
