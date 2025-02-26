import type { APIEvent } from "@solidjs/start/server";
import type { Session } from "neo4j-driver";

import { convertNodeToJson } from "~/cypher/convertNodeToJson";
import { getDBSessionForSubdomain } from "~/cypher/get/getSessionForSubdomain";
import { createActivityLog } from "~/cypher/mutate/activity/createActivityLog";
import { checkRole } from "~/cypher/permissions/checkPermission";
import { SYSTEM_ROLES } from "~/cypher/permissions/types";
import { APIError, handleAPIError } from "~/lib/api/apiErrorHandler";
import { getUserFromSession } from "~/server/auth/session/getUserFromSession";

export async function POST({ request }: APIEvent) {
  const { dbSession } = await getDBSessionForSubdomain(request);
  try {
    const user = await getUserFromSession(request);

    if (!user) {
      throw new APIError("User not found", 404);
    }

    const isAdmin = await checkRole(
      request,
      SYSTEM_ROLES.ADMIN,
      dbSession,
      user,
    );

    if (!isAdmin) {
      throw new APIError("Unauthorized. Admin access required.", 403);
    }

    const { domain, id, key, status } = await request.json();

    if (!id) {
      throw new APIError("Subdomain key required", 400);
    }

    // Get the user's account and verify subdomain access
    const accessResult = await dbSession.run(
      `
      MATCH (u:User {uuid: $uuid})<-[:AccountUser]-(a:Account)-[:AccountSubdomain]->(s:SubDomain)
      WHERE elementId(s) = $subdomainId
      RETURN a, s
    `,
      {
        subdomainId: id,
        uuid: user.P.uuid,
      },
    );

    if (accessResult.records.length === 0) {
      throw new APIError("Unauthorized access to subdomain", 403);
    }

    await validateDomain(dbSession, id, domain);
    const updatedSubdomain = await updateSubdomain(
      dbSession,
      id,
      domain,
      key,
      status,
    );

    await createActivityLog(
      dbSession,
      "SESSION_UPDATE",
      "SubDomain",
      updatedSubdomain.id,
      user.P.email,
      `Updated subdomain ${key} with domain ${domain}`,
    );

    return {
      graph: {
        edges: {},
        vertexes: { [updatedSubdomain.id]: updatedSubdomain },
      },
      result: updatedSubdomain,
    };
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}

async function updateSubdomain(
  dbSession: Session,
  id: string,
  domain: string,
  key: string,
  status?: string,
) {
  const result = await dbSession.run(
    `MATCH (s:SubDomain) where elementId(s) = $id
     SET s.domain = $domain,
     s.status = $status,
     s.lastModified = datetime()
     RETURN s`,
    // s.key = $key,
    { domain, id, key, status: status || "active" },
  );

  if (!result.records[0]) {
    throw new APIError("Subdomain not found", 404);
  }

  return convertNodeToJson(result.records[0].get("s"));
}

async function validateDomain(
  dbSession: Session,
  currentId: string,
  newDomain: string,
) {
  const existingDomain = await dbSession.run(
    `MATCH (s:SubDomain {domain: $domain})
     WHERE elementId(s) <> $currentId
     RETURN s`,
    { currentId, domain: newDomain },
  );

  if (existingDomain.records.length > 0) {
    throw new APIError("Domain name is already taken", 400);
  }
}
