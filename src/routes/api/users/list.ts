import type { APIEvent } from "@solidjs/start/dist/server";

import { convertNodeToJson } from "~/cypher/convertNodeToJson";
import { getDBSessionForSubdomain } from "~/cypher/get/getSessionForSubdomain";
import { handleAPIError } from "~/lib/api/apiErrorHandler";
import { getUserFromSession } from "~/server/session/getUserFromSession";

export async function GET({ request }: APIEvent) {
  const { dbSession } = await getDBSessionForSubdomain(request);

  try {
    const user = await getUserFromSession(request);
    if (!user?.P?.email) {
      throw new Error("Unauthorized");
    }

    const result = await dbSession.run(`
      MATCH (u:User)
      OPTIONAL MATCH (u)-[:UserRole]->(r:Role)
      RETURN u, r.name as role
      ORDER BY u.email ASC
    `);

    const users = result.records.map((record) => {
      const userNode = convertNodeToJson(record.get("u"));
      return {
        ...userNode,
        P: {
          ...userNode.P,
          role: record.get("role") || "User",
        },
      };
    });

    return new Response(JSON.stringify({ users }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}
