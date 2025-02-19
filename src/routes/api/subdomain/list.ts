import type { APIEvent } from "@solidjs/start/dist/server";
import type { Node } from "neo4j-driver";

import { convertNodeToJson } from "~/cypher/convertNodeToJson";
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

    // Get subdomains for current user with their latest activity
    const result = await dbSession.run(
      `
      MATCH (u:User {email: $email})-[:UserSubDomain]->(s:SubDomain)
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

    return new Response(
      JSON.stringify({
        subdomains,
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}
