import type { APIEvent } from "@solidjs/start/server";

import { getDBSessionForSubdomain } from "~/cypher/get/getSessionForSubdomain";
import { handleAPIError } from "~/lib/api/apiErrorHandler";

export async function POST({ request }: APIEvent) {
  const { dbSession } = await getDBSessionForSubdomain(request);
  const { message, ticketId, userId } = await request.json();

  try {
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
        createdBy: $userId
      })<-[:ParentSupport]-(t)
      RETURN r
    `;

    await dbSession.run(query, { message, ticketId, userId });

    return {
      graph: {
        edges: {},
        vertexes: {},
      },
      result: {
        message: "Reply added successfully",
      },
    };
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}
