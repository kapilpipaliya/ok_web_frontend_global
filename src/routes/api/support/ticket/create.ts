import type { APIEvent } from "@solidjs/start/server";

import { convertNodeToJson } from "~/cypher/conversion/convertNodeToJson";
import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import { handleAPIError } from "~/lib/api/apiErrorHandler";

export async function POST({ request }: APIEvent) {
  const { dbSession } = await getDBSessionForSubdomain(request);
  const { email, message, name, subject } = await request.json();

  try {
    const query = `
      CREATE (t:Support {
        name: $name,
        email: $email,
        subject: $subject,
        message: $message,
        createdAt: datetime()
      })
      WITH t
      MATCH (status:SupportStatus {key: 'Open'})
      CREATE (t)-[:SupportSupportStatus]->(status)
      RETURN t, status
    `;

    const result = await dbSession.run(query, {
      email,
      message,
      name,
      subject,
    });

    const ticket = convertNodeToJson(result.records[0].get("t"));

    return {
      graph: {
        edges: {},
        vertexes: {
          [ticket.id]: ticket,
        },
      },
      result: ticket,
    };
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}
