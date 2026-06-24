import type { APIEvent } from "@solidjs/start/server";

import { convertNodeToJson } from "~/cypher/conversion/convertNodeToJson";
import { createActivityLog } from "~/cypher/mutate/activity/createActivityLog";
import { checkRole } from "~/cypher/permissions/isPermission";
import { SYSTEM_ROLES } from "~/cypher/permissions/type/types";
import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import { APIError, handleAPIError } from "~/lib/api/server/apiErrorHandler";
import { getUserFromSession } from "~/server/auth/session/getUserFromSession";

export async function POST({ request }: APIEvent) {
  const { dbSession } = await getDBSessionForSubdomain(request);

  try {
    const user = await getUserFromSession(request);

    if (!user) {
      throw new APIError("User not found", 404);
    }

    const isAdmin = await checkRole(SYSTEM_ROLES.ADMIN, dbSession, user);

    if (!isAdmin) {
      throw new APIError("Unauthorized. Admin access required.", 403);
    }

    const body = await request.json();
    const robotsTxt = typeof body.robotsTxt === "string" ? body.robotsTxt : "";

    const result = await dbSession.run(
      `MERGE (r:RobotsTxt { key: $key })
       ON CREATE SET r.robotsTxt = $robotsTxt, r.createdAt = datetime(), r.updatedAt = datetime()
       ON MATCH SET r.robotsTxt = $robotsTxt, r.updatedAt = datetime()
       RETURN r`,
      { key: "default", robotsTxt },
    );

    const robotsTxtVertex = convertNodeToJson(result.records[0].get("r"));

    await createActivityLog(
      dbSession,
      "UPDATE_ROBOTS_TXT",
      "RobotsTxt",
      robotsTxtVertex.P?.key ?? "default",
      user?.P?.email ?? "",
      "Updated robots.txt content",
    );

    return {
      graph: {
        edges: {},
        vertexes: { [robotsTxtVertex.id]: robotsTxtVertex },
      },
      result: robotsTxtVertex,
    };
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}
