import type { APIEvent } from "@solidjs/start/server";

import type { Vertex } from "~/lib/graph/graph";

import { convertNodeToJson } from "~/cypher/convertNodeToJson";
import { getDBSessionForSubdomain } from "~/cypher/get/getSessionForSubdomain";
import { getHttpsSession } from "~/server/session/getHttpsSession";

export async function getUserFromSession(
  request?: APIEvent["request"],
): Promise<undefined | Vertex> {
  const httpSession = await getHttpsSession();
  const sessionUser = httpSession?.data?.user;

  if (!sessionUser) {
    return;
  }

  // Get user password from database
  const { dbSession } = await getDBSessionForSubdomain(request);
  const query = "MATCH (u:User) WHERE elementId(u) = $id RETURN u as u";
  const result = await dbSession.run(query, { id: sessionUser.id });
  const userFromDb =
    result.records.length > 0
      ? convertNodeToJson(result.records[0].get("u"))
      : null;

  // Return undefined if passwords don't match
  if (!userFromDb || userFromDb.P.password !== sessionUser.P.password) {
    return;
  }

  return sessionUser;
}
