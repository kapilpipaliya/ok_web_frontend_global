import type { APIEvent } from "@solidjs/start/dist/server";

import { convertNodeToJson } from "~/cypher/convertNodeToJson";
import { getDBSessionForSubdomain } from "~/cypher/get/getSessionForSubdomain";
import { APIError } from "~/lib/api/apiErrorHandler";
import { handleAPIError } from "~/lib/api/apiErrorHandler";
import { isAdminRole } from "~/lib/graph/get/sync/isAdminRole";
import { useGraph } from "~/lib/graph/graph";
import { getUserFromSession } from "~/server/session/getUserFromSession";

export async function POST({ request }: APIEvent) {
  const { dbSession } = await getDBSessionForSubdomain(request);

  try {
    const user = await getUserFromSession(request);
    // const [graph] = useGraph();

    // if (!(user?.P?.email && isAdminRole(graph))) {
    //   throw new APIError("Unauthorized", 401);
    // }

    const { description, name, permissions } = await request.json();

    // Check if role exists
    const existingRole = await dbSession.run(
      "MATCH (r:Role {name: $name}) RETURN r",
      { name },
    );

    if (existingRole.records.length === 0) {
      throw new APIError("Role not found", 404);
    }

    const result = await dbSession.run(
      `
      MATCH (r:Role {name: $name})
      SET r.description = $description,
          r.permissions = $permissions,
          r.updatedAt = datetime()
      RETURN r
    `,
      { description, name, permissions },
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
