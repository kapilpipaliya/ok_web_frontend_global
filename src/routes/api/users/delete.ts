import type { APIEvent } from "@solidjs/start/dist/server";

import { getDBSessionForSubdomain } from "~/cypher/get/getSessionForSubdomain";
import { APIError } from "~/lib/api/apiErrorHandler";
import { handleAPIError } from "~/lib/api/apiErrorHandler";
import { isAdminRole } from "~/lib/graph/get/sync/isAdminRole";
import { useGraph } from "~/lib/graph/graph";
import { getUserFromSession } from "~/server/session/getUserFromSession";

export async function POST({ request }: APIEvent) {
  const { dbSession } = await getDBSessionForSubdomain(request);

  try {
    const currentUser = await getUserFromSession(request);
    // const [graph] = useGraph();

    // if (!(currentUser?.P?.email && isAdminRole(graph))) {
    //   throw new APIError("Unauthorized", 401);
    // }

    const { uuid } = await request.json();

    // Prevent self-deletion
    if (uuid === currentUser.P.uuid) {
      throw new APIError("Cannot delete your own account", 400);
    }

    // Check if user exists
    const userCheck = await dbSession.run(
      `
      MATCH (u:User {uuid: $uuid})
      RETURN u
    `,
      { uuid },
    );

    if (userCheck.records.length === 0) {
      throw new APIError("User not found", 404);
    }

    // Delete user and all relationships
    await dbSession.run(
      `
      MATCH (u:User {uuid: $uuid})
      OPTIONAL MATCH (u)-[r]-()
      DELETE u, r
    `,
      { uuid },
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
