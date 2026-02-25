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
    const robotsTxt =
      typeof body.robotsTxt === "string" ? body.robotsTxt : "";

    const checkResult = await dbSession.run(
      `MATCH (s:GlobalSetting) RETURN s LIMIT 1`,
    );

    let settingsVertex: ReturnType<typeof convertNodeToJson>;

    if (checkResult.records.length === 0) {
      const createResult = await dbSession.run(
        `CREATE (s:GlobalSetting {
          key: $key,
          robotsTxt: $robotsTxt,
          createdAt: datetime(),
          updatedAt: datetime()
        })
        RETURN s`,
        { key: "Default", robotsTxt },
      );
      settingsVertex = convertNodeToJson(createResult.records[0].get("s"));
    } else {
      const result = await dbSession.run(
        `MATCH (s:GlobalSetting)
         SET s.robotsTxt = $robotsTxt,
             s.updatedAt = datetime()
         RETURN s`,
        { robotsTxt },
      );
      settingsVertex = convertNodeToJson(result.records[0].get("s"));
    }

    await createActivityLog(
      dbSession,
      "UPDATE_ROBOTS_TXT",
      "GlobalSetting",
      settingsVertex.P?.key ?? "Default",
      user?.P?.email ?? "",
      "Updated robots.txt content",
    );

    return {
      graph: {
        edges: {},
        vertexes: { [settingsVertex.id]: settingsVertex },
      },
      result: settingsVertex,
    };
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}
