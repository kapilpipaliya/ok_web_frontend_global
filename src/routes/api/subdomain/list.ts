import type { APIEvent } from "@solidjs/start/server";
import type { Node } from "neo4j-driver";

import type { Vertex } from "~/lib/graph/graph";
import type { Edge } from "~/lib/graph/graph";

import { convertNodeToJson } from "~/cypher/convertNodeToJson";
import { processResult } from "~/cypher/get/evaluate/processResult";
import { getDBSessionForSubdomain } from "~/cypher/get/getSessionForSubdomain";
import { APIError, handleAPIError } from "~/lib/api/apiErrorHandler";
import { getUserFromSession } from "~/server/session/getUserFromSession";

export async function GET({ request }: APIEvent) {
  const { dbSession } = await getDBSessionForSubdomain(request);

  try {
    const user = await getUserFromSession(request);
    if (!user?.P?.email) {
      throw new APIError("Unauthorized", 401);
    }

    const nodes: { [key: string]: Vertex } = {};
    const relationships: { [key: string]: Edge } = {};

    // Get subdomains through Account relationship
    const result = await dbSession.run(
      `
      MATCH (u:User {email: $email})<-[:AccountUser]-(a:Account)-[:AccountSubdomain]->(s:SubDomain)
      OPTIONAL MATCH (a:Activity)
      WHERE a.entityType = 'SubDomain' AND a.entityId = s.key
      WITH s, a
      ORDER BY a.timestamp DESC
      WITH s, collect(a)[0..5] as recentActivities
      RETURN s as subdomain, recentActivities
      ORDER BY s.createdAt DESC
    `,
      { email: user?.P?.email },
    );

    processResult(result.records, { nodes, relationships }, "subdomain", "");

    const subdomains = result.records.map((record) => {
      const subdomainNode = convertNodeToJson(record.get("subdomain"));
      const activities = record.get("recentActivities")
        ? record
            .get("recentActivities")
            .map((activity: Node) => convertNodeToJson(activity))
        : [];

      return {
        ...subdomainNode,
        P: {
          ...subdomainNode.P,
          recentActivities: activities,
        },
      };
    });

    return {
      graph: {
        edges: relationships,
        vertexes: nodes,
      },
      result: subdomains,
      timestamp: new Date().getTime(),
    };
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}
