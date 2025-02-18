import type { APIEvent } from "@solidjs/start/dist/server";
import { APIError } from "~/lib/api/apiErrorHandler";
import { getDBSessionForSubdomain } from "~/cypher/get/getSessionForSubdomain";
import { handleAPIError } from "~/lib/api/apiErrorHandler";
import { isAdminRole } from "~/lib/graph/get/sync/isAdminRole";
import { useGraph } from "~/lib/graph/graph";
import { getUserFromSession } from "~/server/session/getUserFromSession";

export async function POST({ request }: APIEvent) {
  const { dbSession } = await getDBSessionForSubdomain(request);

  try {
    const user = await getUserFromSession(request);
    const [graph] = useGraph();
    
    if (!user?.P?.email || !isAdminRole(graph)) {
      throw new APIError("Unauthorized", 401);
    }

    const { name } = await request.json();

    // Check if role exists and is not in use
    const roleCheck = await dbSession.run(`
      MATCH (r:Role {name: $name})
      OPTIONAL MATCH (u:User)-[:HAS_ROLE]->(r)
      RETURN r, count(u) as userCount
    `, { name });

    if (roleCheck.records.length === 0) {
      throw new APIError("Role not found", 404);
    }

    const userCount = roleCheck.records[0].get("userCount").toNumber();
    if (userCount > 0) {
      throw new APIError("Cannot delete role that is assigned to users", 400);
    }

    // Delete the role
    await dbSession.run(`
      MATCH (r:Role {name: $name})
      DELETE r
    `, { name });

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