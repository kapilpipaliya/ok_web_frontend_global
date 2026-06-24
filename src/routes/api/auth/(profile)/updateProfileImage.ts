import type { APIEvent } from "@solidjs/start/server";
import type { Record as Neo4jRecord } from "neo4j-driver";

import { convertNodeToJson } from "~/cypher/conversion/convertNodeToJson";
import { processResult } from "~/cypher/conversion/processResult";
import { createActivityLog } from "~/cypher/mutate/activity/createActivityLog";

import { APIError, handleAPIError } from "~/lib/api/server/apiErrorHandler";
import type { Edge } from "~/lib/graph/type/edge";
import type { Vertex } from "~/lib/graph/type/vertex";
import { getUserFromSession } from "~/server/auth/session/getUserFromSession";
import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";

function buildUserProfileImageGraph(records: Neo4jRecord[]) {
  const context: {
    nodes: Record<string, Vertex>;
    relationships: Record<string, Edge>;
  } = { nodes: {}, relationships: {} };
  processResult(records, context, ["u", "f"], "r");
  return { vertexes: context.nodes, edges: context.relationships };
}

export async function POST({ request }: APIEvent) {
  const { profileImage, uuid } = await request.json();
  const { dbSession } = await getDBSessionForSubdomain(request);

  try {
    const user = await getUserFromSession(request);

    if (!user) {
      throw new APIError("User not found", 404);
    }
    if (user.P.uuid !== uuid) {
      throw new APIError("User not authorized", 401);
    }

    if (!profileImage) {
      throw new APIError("Profile image is required", 400);
    }

    const deleteOtherProfileImageEdgesResult = await dbSession.run(
      `MATCH (u:User {uuid: $uuid})-[r:UserProfileImage]->(f:File)
       WHERE elementId(f) <> $profileImage
       WITH collect(elementId(r)) AS deletedEdgeIds, collect(r) AS relationshipsToDelete
       FOREACH (relationship IN relationshipsToDelete | DELETE relationship)
       RETURN deletedEdgeIds`,
      { profileImage, uuid },
    );

    const deletedEdgeIdsRaw =
      deleteOtherProfileImageEdgesResult.records[0]?.get("deletedEdgeIds");
    const deletedEdgeIds = Array.isArray(deletedEdgeIdsRaw)
      ? deletedEdgeIdsRaw
          .map((edgeId) => (edgeId == null ? "" : String(edgeId).trim()))
          .filter((edgeId) => edgeId !== "")
      : [];

    const linkResult = await dbSession.run(
      `MATCH (u:User {uuid: $uuid})
       MATCH (f:File) WHERE elementId(f) = $profileImage
       MERGE (u)-[r:UserProfileImage]->(f)
       RETURN u, r, f`,
      { profileImage, uuid },
    );

    if (!(linkResult.records[0]?.get("u") && linkResult.records[0]?.get("f"))) {
      throw new APIError("User or file not found", 404);
    }

    const rawFileNode = linkResult.records[0].get("f");
    const graphPayload = buildUserProfileImageGraph(linkResult.records);

    const fileJson = convertNodeToJson(rawFileNode);

    await createActivityLog(
      dbSession,
      "profile_image_update",
      "User",
      uuid,
      user.P.email,
      `Profile image updated to ${fileJson.P.fileName || fileJson.id}`,
    );

    return {
      graph: {
        vertexes: graphPayload.vertexes,
        edges: graphPayload.edges,
        deleted_edges: deletedEdgeIds,
      },
      success: true,
      timestamp: new Date().getTime(),
    };
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}
