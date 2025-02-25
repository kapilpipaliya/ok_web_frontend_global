import type { APIEvent } from "@solidjs/start/server";

import { getDBSessionForSubdomain } from "~/cypher/get/getSessionForSubdomain";
import { APIError } from "~/lib/api/apiErrorHandler";
import { handleAPIError } from "~/lib/api/apiErrorHandler";
import { getUserFromSession } from "~/server/session/getUserFromSession";

export async function DELETE({ request }: APIEvent) {
  const { dbSession } = await getDBSessionForSubdomain(request);

  try {
    const currentUser = await getUserFromSession(request);
    // const [graph] = useGraph();

    // if (!(currentUser?.P?.email && isAdminRole(graph))) {
    //   throw new APIError("Unauthorized", 401);
    // }

    const { id } = await request.json();

    // Prevent self-deletion
    if (id === currentUser?.id) {
      throw new APIError("Cannot delete your own account", 400);
    }

    // Check if user exists
    const userCheck = await dbSession.run(
      `
      MATCH (u:User)
      WHERE elementId(u) = $id
      RETURN u
    `,
      { id },
    );

    if (userCheck.records.length === 0) {
      throw new APIError("User not found", 404);
    }

    // Delete user and all relationships
    await dbSession.run(
      `
      MATCH (u:User)
      WHERE elementId(u) = $id
      OPTIONAL MATCH (u)-[r]-()
      DELETE u, r
    `,
      { id },
    );

    return {
      graph: {
        deleted_vertexes: [id]
      },
      success: true
    }
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}
