import type { APIEvent } from "@solidjs/start/server";

import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import { APIError, handleAPIError } from "~/lib/api/apiErrorHandler";
import { getUserFromSession } from "~/server/auth/session/getUserFromSession";

export async function POST({ request }: APIEvent) {
  const { dbSession } = await getDBSessionForSubdomain(request);
  const { message, ticketId } = await request.json();

  try {
    const user = await getUserFromSession(request);

    if (!user) {
      throw new APIError("User not found", 404);
    }

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
      })<-[:ParentSupport]-(t)
      RETURN r
    `;

    await dbSession.run(query, { email: user.P.email, message, ticketId });

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
