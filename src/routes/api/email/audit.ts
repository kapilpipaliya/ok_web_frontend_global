import type { APIEvent } from "@solidjs/start/server";

import type { Edge, Vertex } from "~/lib/graph/graph";

import { processResult } from "~/cypher/get/evaluate/processResult";
import { getDBSessionForSubdomain } from "~/cypher/get/getSessionForSubdomain";
import { handleAPIError } from "~/lib/api/apiErrorHandler";

export async function GET({ request }: APIEvent) {
  const { dbSession } = await getDBSessionForSubdomain(request);

  try {
    const nodes: { [key: string]: Vertex } = {};
    const relationships: { [key: string]: Edge } = {};

    const result = await dbSession.run(`
      MATCH (e:Email)
      RETURN e
      ORDER BY e.sentAt DESC
      LIMIT 100
    `);

    const emails = processResult(
      result.records,
      { nodes, relationships },
      "e",
      "",
    );

    return {
      graph: {
        edges: relationships,
        vertexes: nodes,
      },
      result: emails,
      timestamp: new Date().getTime(),
    };
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}
