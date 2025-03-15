import type { APIEvent } from "@solidjs/start/server";

import type { Edge, Vertex } from "~/lib/graph/graph";

import { processResult } from "~/cypher/conversion/processResult";
import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import { APIError, handleAPIError } from "~/lib/api/server/apiErrorHandler";
import { getUserFromSession } from "~/server/auth/session/getUserFromSession";

export async function POST({ request }: APIEvent) {
  const { dbSession } = await getDBSessionForSubdomain(request);
  const { message, ticketId } = await request.json();

  try {
    const user = await getUserFromSession(request);

    if (!user) {
      throw new APIError("User not found", 404);
    }
    const nodes: { [key: string]: Vertex } = {};
    const relationships: { [key: string]: Edge } = {};
    // const data = await newRowAPICall(
    //     parentVertexId,
    //     "SupportUser",
    //     "",
    //     newMessage,
    //   );
    const query = `
      MATCH (t:Support) WHERE elementId(t) = $ticketId
      CREATE (r:Reply {
        message: $message,
        createdAt: datetime(),
        email: $email
      })-[tr:ParentSupport]->(t)
      RETURN t, tr, r
    `;
    const result = await dbSession.run(query, {
      email: user.P.email,
      message,
      ticketId,
    });
    processResult(result.records, { nodes, relationships }, ["t", "r"], "tr");
    return {
      graph: {
        edges: relationships,
        vertexes: nodes,
      },
      result: [],
      timestamp: new Date().getTime(),
    };
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}
