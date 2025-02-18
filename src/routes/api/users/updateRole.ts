import type { APIEvent } from "@solidjs/start/dist/server";
import { getDBSessionForSubdomain } from "~/cypher/get/getSessionForSubdomain";
import { handleAPIError, APIError } from "~/lib/api/apiErrorHandler";
import { getUserFromSession } from "~/server/session/getUserFromSession";
import { isAdminRole } from "~/lib/graph/get/sync/isAdminRole";
import { useGraph } from "~/lib/graph/graph";

export async function POST({ request }: APIEvent) {
  const { dbSession } = await getDBSessionForSubdomain(request);

  try {
    const user = await getUserFromSession(request);
    const [graph] = useGraph();
    
    if (!user?.P?.email || !isAdminRole(graph)) {
      throw new APIError("Unauthorized", 401);
    }

    const { userId, roleName } = await request.json();

    // Remove existing role relationship
    await dbSession.run(`
      MATCH (u:User {uuid: $userId})-[r:HAS_ROLE]->(:Role)
      DELETE r
    `, { userId });

    // Create new role relationship
    await dbSession.run(`
      MATCH (u:User {uuid: $userId}), (r:Role {name: $roleName})
      CREATE (u)-[:HAS_ROLE]->(r)
    `, { userId, roleName });

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