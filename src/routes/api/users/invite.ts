import type { APIEvent } from "@solidjs/start/dist/server";

import { v7 as uuidv7 } from "uuid";

import { getDBSessionForSubdomain } from "~/cypher/get/getSessionForSubdomain";
import { APIError, handleAPIError } from "~/lib/api/apiErrorHandler";
import { isAdminRole } from "~/lib/graph/get/sync/isAdminRole";
import { useGraph } from "~/lib/graph/graph";
import { getUserFromSession } from "~/server/session/getUserFromSession";

export async function POST({ request }: APIEvent) {
  const { dbSession } = await getDBSessionForSubdomain(request);

  try {
    const user = await getUserFromSession(request);
    const [graph] = useGraph();

    if (!(user?.P?.email && isAdminRole(graph))) {
      throw new APIError("Unauthorized", 401);
    }

    const { email, roleName } = await request.json();

    // Check if user already exists
    const existingUser = await dbSession.run(
      "MATCH (u:User {email: $email}) RETURN u",
      { email },
    );

    if (existingUser.records.length > 0) {
      throw new APIError("User with this email already exists", 400);
    }

    // Create new user
    const _result = await dbSession.run(
      `
      CREATE (u:User {
        uuid: $uuid,
        email: $email,
        status: "invited",
        createdAt: datetime()
      })
      WITH u
      MATCH (r:Role {name: $roleName})
      CREATE (u)-[:UserRole]->(r)
      RETURN u
    `,
      {
        email,
        roleName,
        uuid: uuidv7(),
      },
    );

    // TODO: Send invitation email

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}
