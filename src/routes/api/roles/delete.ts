import type { APIEvent } from "@solidjs/start/dist/server";

import { getDBSessionForSubdomain } from "~/cypher/get/getSessionForSubdomain";
import { APIError } from "~/lib/api/apiErrorHandler";
import { handleAPIError } from "~/lib/api/apiErrorHandler";
import { getUserFromSession } from "~/server/session/getUserFromSession";

export async function POST({ request }: APIEvent) {
  const { dbSession } = await getDBSessionForSubdomain(request);

  try {
    const _user = await getUserFromSession(request);
    // const [graph] = useGraph();

    // if (!(user?.P?.email && isAdminRole(graph))) {
    //   throw new APIError("Unauthorized", 401);
    // }

    const { key } = await request.json();

    // Check if role exists and is not in use
    const roleCheck = await dbSession.run(
      `
      MATCH (r:Role {key: $key})
      OPTIONAL MATCH (u:User)-[:UserRole]->(r)
      RETURN r, count(u) as userCount
    `,
      { key },
    );

    if (roleCheck.records.length === 0) {
      throw new APIError("Role not found", 404);
    }

    const userCount = roleCheck.records[0].get("userCount").toNumber();
    if (userCount > 0) {
      throw new APIError("Cannot delete role that is assigned to users", 400);
    }

    // Delete the role
    await dbSession.run(
      `
      MATCH (r:Role {key: $key})
      DELETE r
    `,
      { key },
    );

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
