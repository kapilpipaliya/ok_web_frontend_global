import type { APIEvent } from "@solidjs/start/server";
import type { Node } from "neo4j-driver";

import type { Vertex } from "~/lib/graph/graph";
import type { Edge } from "~/lib/graph/graph";

import { convertNodeToJson } from "~/cypher/conversion/convertNodeToJson";
import { processResult } from "~/cypher/queries/evaluate/processResult";
import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import { checkRole } from "~/cypher/permissions/checkPermission";
import { SYSTEM_ROLES } from "~/cypher/permissions/types";
import { APIError, handleAPIError } from "~/lib/api/apiErrorHandler";
import { getUserFromSession } from "~/server/auth/session/getUserFromSession";

export async function POST({ request }: APIEvent) {
  const { dbSession } = await getDBSessionForSubdomain(request);
  const user = await getUserFromSession(request);

  if (!user) {
    throw new APIError("User not found", 404);
  }

  const isAdmin = await checkRole(request, SYSTEM_ROLES.ADMIN, dbSession, user);

  if (!isAdmin) {
    throw new APIError("Unauthorized. Admin access required.", 403);
  }

  try {
    // Query based on user role
    const query = isAdmin
      ? `
        MATCH (s:Support)
        OPTIONAL MATCH (s)<-[r:ParentSupport]-(reply:Reply)
        WITH s, collect(reply)[0..5] as replies
        RETURN s as support, replies
        ORDER BY s.createdAt DESC
      `
      : `
        MATCH (s:Support)
        WHERE s.email = $email
        OPTIONAL MATCH (s)<-[r:ParentSupport]-(reply:Reply)
        WITH s, collect(reply)[0..5] as replies
        RETURN s as support, replies
        ORDER BY s.createdAt DESC
      `;

    const result = await dbSession.run(query, {
      email: user.P.email, // Using email as userId for non-admin users
    });

    const nodes: { [key: string]: Vertex } = {};
    const relationships: { [key: string]: Edge } = {};

    const tickets = result.records.map((record) => {
      const supportNode = convertNodeToJson(record.get("support"));
      const replies = record.get("replies")
        ? record.get("replies").map((reply: Node) => convertNodeToJson(reply))
        : [];

      return {
        ...supportNode,
        P: {
          ...supportNode.P,
          replies: replies,
        },
      };
    });

    processResult(result.records, { nodes, relationships }, "support", "");
    return {
      graph: {
        edges: relationships,
        vertexes: nodes,
      },
      result: tickets,
      timestamp: new Date().getTime(),
    };
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}
