import type { APIEvent } from "@solidjs/start/dist/server";

import { convertNodeToJson } from "~/cypher/convertNodeToJson";
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

    const { description, key, name, permissions } = await request.json();

    // Check if role already exists
    const existingRole = await dbSession.run(
      "MATCH (r:Role {key: $key}) RETURN r",
      { key },
    );

    if (existingRole.records.length > 0) {
      throw new APIError("Role with this name already exists", 400);
    }

    const result = await dbSession.run(
      `
      CREATE (r:Role {
        key: $key,
        description: $description,
        permissions: $permissions,
        createdAt: datetime(),
        updatedAt: datetime()
      })
      RETURN r
    `,
      { description, key, name, permissions },
    );

    const role = convertNodeToJson(result.records[0].get("r"));

    return new Response(JSON.stringify({ role }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}
