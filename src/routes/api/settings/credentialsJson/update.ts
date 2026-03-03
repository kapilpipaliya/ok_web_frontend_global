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
    const credentialsJson =
      typeof body.credentialsJson === "string" ? body.credentialsJson : "";

    const result = await dbSession.run(
      `MERGE (c:CredentialsJson { key: $key })
       ON CREATE SET c.credentialsJson = $credentialsJson, c.createdAt = datetime(), c.updatedAt = datetime()
       ON MATCH SET c.credentialsJson = $credentialsJson, c.updatedAt = datetime()
       RETURN c`,
      { key: "default", credentialsJson },
    );

    const credentialsVertex = convertNodeToJson(result.records[0].get("c"));

    await createActivityLog(
      dbSession,
      "UPDATE_CREDENTIALS_JSON",
      "CredentialsJson",
      credentialsVertex.P?.key ?? "default",
      user?.P?.email ?? "",
      "Updated credentials JSON",
    );

    return {
      graph: {
        edges: {},
        vertexes: { [credentialsVertex.id]: credentialsVertex },
      },
      result: credentialsVertex,
    };
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}
