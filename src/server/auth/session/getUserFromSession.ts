import type { APIEvent } from "@solidjs/start/server";

import { convertNodeToJson } from "~/cypher/conversion/convertNodeToJson";
import { SYSTEM_DB_NAME } from "~/cypher/core/boltConstant";
import { getDriver } from "~/cypher/core/driver";
import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import { getHttpsSession } from "~/server/auth/session/getHttpsSession";
import type { Vertex } from "~/lib/graph/type/vertex";

export async function getUserFromSession(
  request?: APIEvent["request"],
): Promise<undefined | Vertex> {
  let dbSession = null;
  let adminDbSession = null;

  try {
    const httpSession = await getHttpsSession();
    const sessionUser = httpSession?.data?.user;

    if (!sessionUser) {
      return;
    }

    // Get user password from database
    const sessionData = await getDBSessionForSubdomain(request);
    dbSession = sessionData.dbSession;
    const query = "MATCH (u:User) WHERE u.uuid = $uuid RETURN u as u";
    const result = await dbSession.run(query, { uuid: sessionUser.P.uuid });

    if (result.records.length === 0) {
      return;
    }

    const userFromDb = convertNodeToJson(result.records[0].get("u"));

    if (userFromDb?.P.isSystemUser) {
      adminDbSession = (await getDriver()).session({
        database: SYSTEM_DB_NAME,
      });
      const adminDbResult = await adminDbSession.run(query, {
        uuid: sessionUser.P.uuid,
      });

      if (adminDbResult.records.length === 0) {
        return;
      }
      const adminUser = convertNodeToJson(adminDbResult.records[0].get("u"));
      if (adminUser.P.password === sessionUser.P.password) {
        return adminUser;
      }
      return;
    }
    // Return undefined if passwords don't match
    if (!userFromDb || userFromDb.P.password !== sessionUser.P.password) {
      return;
    }

    return sessionUser;
  } catch {
    // Handle the error silently, returning undefined
    return;
  } finally {
    // Ensure sessions are always closed
    if (dbSession) {
      await dbSession.close();
    }
    if (adminDbSession) {
      await adminDbSession.close();
    }
  }
}
