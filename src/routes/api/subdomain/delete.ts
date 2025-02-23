import type { APIEvent } from "@solidjs/start/dist/server";
import type { Session } from "neo4j-driver";

import { getDBSessionForSubdomain } from "~/cypher/get/getSessionForSubdomain";
import { createActivityLog } from "~/cypher/mutate/activity/createActivityLog";
import { findUserByEmailSimple } from "~/cypher/mutate/user/findUserByEmail";
import { APIError, handleAPIError } from "~/lib/api/apiErrorHandler";
import { getUserFromSession } from "~/server/session/getUserFromSession";

// Not used in the system yet
export async function POST({ request }: APIEvent) {
  const { dbSession } = await getDBSessionForSubdomain(request);
  try {
    const { key } = await request.json();

    if (!key) {
      throw new APIError("Subdomain key required", 400);
    }

    const user = await validateUser(
      (await getUserFromSession(request))?.P.email,
      dbSession
    );

    // Get the user's account and verify subdomain access
    const accessResult = await getAccountAndSubdomain(dbSession, key, user.P.uuid);

    if (accessResult.records.length === 0) {
      throw new APIError("Unauthorized access to subdomain", 403);
    }

    const account = accessResult.records[0].get("a");
    const subdomain = accessResult.records[0].get("s");

    // Delete the edge between Account and SubDomain
    await removeAccountSubdomainRelation(dbSession, account.properties.id, key);

    // Remove the SubDomain vertex
    await removeSubdomainNode(dbSession, key);

    await createActivityLog(
      dbSession,
      "SESSION_DELETE",
      "SubDomain",
      subdomain.elementId,
      user.P.email,
      `Deleted subdomain ${key}`
    );

    return { success: true };
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}

async function getAccountAndSubdomain(dbSession: Session, subDomainKey: string, userUuid: string) {
  const query = `
    MATCH (u:User {uuid: $userUuid})<-[:AccountUser]-(a:Account)-[:AccountSubdomain]->(s:SubDomain { key: $key })
    RETURN a, s
  `;
  return await dbSession.run(query, { 
    key: subDomainKey,
    userUuid 
  });
}

async function removeAccountSubdomainRelation(dbSession: Session, accountId: string, subDomainKey: string) {
  const query = `
    MATCH (a:Account)-[r:AccountSubdomain]->(s:SubDomain { key: $key })
    WHERE a.id = $accountId
    DELETE r
  `;
  await dbSession.run(query, { 
    accountId,
    key: subDomainKey 
  });
}

async function removeSubdomainNode(dbSession: Session, subDomainKey: string) {
  const query = `
    MATCH (s:SubDomain { key: $key })
    DELETE s
  `;
  await dbSession.run(query, { key: subDomainKey });
}

async function validateUser(email: null | string, dbSession: Session) {
  if (!email) {
    throw new APIError("Unauthorized", 401);
  }
  const user = await findUserByEmailSimple(dbSession, email);
  if (!user) {
    throw new APIError("Unauthorized", 401);
  }
  return user;
}
