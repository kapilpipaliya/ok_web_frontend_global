import type { APIEvent } from "@solidjs/start/server";

import { getDBSessionForSubdomain } from "~/cypher/get/getSessionForSubdomain";
import { APIError } from "~/lib/api/apiErrorHandler";
import { handleAPIError } from "~/lib/api/apiErrorHandler";
import { getUserFromSession } from "~/server/auth/session/getUserFromSession";

export async function DELETE({ request }: APIEvent) {
  const { dbSession } = await getDBSessionForSubdomain(request);

  try {
    const _user = await getUserFromSession(request);
    // const [graph] = useGraph();

    // if (!(user?.P?.email && isAdminRole(graph))) {
    //   throw new APIError("Unauthorized", 401);
    // }

    const { id } = await request.json();

    // Check if Perm vertex exists and if it has any incoming edges
    const permCheck = await dbSession.run(
      `
      MATCH (p:Perm)
      WHERE elementId(p) = $id
      OPTIONAL MATCH (other)-[r]->(p)
      RETURN p, collect(r) as incomingEdges, count(r) as incomingCount
    `,
      { id },
    );

    if (permCheck.records.length === 0) {
      throw new APIError("Permission not found", 404);
    }

    const incomingCount = permCheck.records[0].get("incomingCount");
    if (incomingCount > 0) {
      throw new APIError(
        "Cannot delete permission that is assigned to other nodes",
        400,
      );
    }

    // Check for ParentPerm outgoing edges and delete them if they exist
    const deletedEdges = await dbSession.run(
      `
      MATCH (p:Perm)-[r:ParentPerm]->()
      WHERE elementId(p) = $id
      DELETE r
      RETURN collect(elementId(r)) as deletedEdgeIds
    `,
      { id },
    );

    // Delete the Perm vertex
    await dbSession.run(
      `
      MATCH (p:Perm)
      WHERE elementId(p) = $id
      DELETE p
    `,
      { id },
    );

    return {
      graph: {
        deleted_edges: deletedEdges.records[0].get("deletedEdgeIds"),
        deleted_vertexes: [id],
      },
      success: true,
    };
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}
