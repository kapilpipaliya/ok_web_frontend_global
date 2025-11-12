import type { APIEvent } from "@solidjs/start/server";
import type { Session } from "neo4j-driver";

import fs from "node:fs";
import path from "node:path";

import { ADMIN_DB_NAME } from "~/cypher/core/boltConstant";
import { getDriver } from "~/cypher/core/driver";
import { createActivityLog } from "~/cypher/mutate/activity/createActivityLog";
import { checkRole } from "~/cypher/permissions/isPermission";
import { SYSTEM_ROLES } from "~/cypher/permissions/type/types";
import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import { APIError, handleAPIError } from "~/lib/api/server/apiErrorHandler";
import { getBaseDir } from "~/lib/files/getBaseDir";
import { getUserFromSession } from "~/server/auth/session/getUserFromSession";
import { stopWorkersForSubdomain } from "~/server/queue/initWorkersCore";
import { deleteAllQueuesForSubdomain } from "~/server/redis/redisManagement";

// Not used in the system yet
export async function DELETE({ request }: APIEvent) {
  const { dbSession, subDomain } = await getDBSessionForSubdomain(request);
  try {
    if (subDomain !== ADMIN_DB_NAME) {
      throw new APIError(
        "Unauthorized. System subdomain access required.",
        403,
      );
    }
    const user = await getUserFromSession(request);

    if (!user) {
      throw new APIError("User not found", 404);
    }

    const isAdmin = await checkRole(SYSTEM_ROLES.ADMIN, dbSession, user);

    if (!isAdmin) {
      throw new APIError("Unauthorized. Admin access required.", 403);
    }

    const { key } = await request.json();

    if (!key) {
      throw new APIError("Subdomain key required", 400);
    }

    // Get the user's account and verify subdomain access
    const accessResult = await getAccountAndSubdomain(
      dbSession,
      key,
      user.P.uuid,
    );

    if (accessResult.records.length === 0) {
      throw new APIError("Unauthorized access to subdomain", 403);
    }

    const account = accessResult.records[0].get("a");
    const subdomain = accessResult.records[0].get("s");

    // Step 1: Stop all workers for this subdomain
    console.log(`[Subdomain Delete] Stopping workers for subdomain: ${key}`);
    await stopWorkersForSubdomain(key);

    // Step 2: Delete all Redis queues for this subdomain
    console.log(
      `[Subdomain Delete] Deleting Redis queues for subdomain: ${key}`,
    );
    const redisResult = await deleteAllQueuesForSubdomain(key);
    if (redisResult.success) {
      console.log(
        `[Subdomain Delete] Deleted ${redisResult.deletedCount} queue(s) for subdomain: ${key}`,
      );
    } else {
      console.error(
        `[Subdomain Delete] Error deleting Redis queues: ${redisResult.error}`,
      );
      // Continue with deletion even if Redis cleanup fails
    }

    // Step 3: Delete the subdomain directory and all files
    console.log(`[Subdomain Delete] Deleting directory for subdomain: ${key}`);
    const deleteResult = await deleteSubdomainDirectory(key);
    if (deleteResult.success) {
      console.log(`[Subdomain Delete] Deleted directory for subdomain: ${key}`);
    } else {
      console.error(
        `[Subdomain Delete] Error deleting directory: ${deleteResult.error}`,
      );
      // Continue with deletion even if directory cleanup fails
    }

    // Step 4: Drop the Neo4j database for this subdomain
    await dropDatabase(key);

    // Step 5: Delete the edge between Account and SubDomain
    await removeAccountSubdomainRelation(dbSession, account.properties.id, key);

    // Step 6: Remove the SubDomain vertex
    await removeSubdomainNode(dbSession, key);

    await createActivityLog(
      dbSession,
      "subdomain_delete",
      "SubDomain",
      subdomain.elementId,
      user.P.email,
      `Deleted subdomain ${key}, dropped database, and removed all files`,
    );

    return {
      graph: {
        deleted_vertexes: [subdomain.elementId],
      },
      success: true,
    };
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}

async function getAccountAndSubdomain(
  dbSession: Session,
  subDomainKey: string,
  userUuid: string,
) {
  const query = `
    MATCH (u:User {uuid: $userUuid})<-[:AccountUser]-(a:Account)-[:AccountSubdomain]->(s:SubDomain { key: $key })
    RETURN a, s
  `;
  return await dbSession.run(query, {
    key: subDomainKey,
    userUuid,
  });
}

async function removeAccountSubdomainRelation(
  dbSession: Session,
  accountId: string,
  subDomainKey: string,
) {
  const query = `
    MATCH (a:Account)-[r:AccountSubdomain]->(s:SubDomain { key: $key })
    WHERE a.id = $accountId
    DELETE r
  `;
  await dbSession.run(query, {
    accountId,
    key: subDomainKey,
  });
}

async function removeSubdomainNode(dbSession: Session, subDomainKey: string) {
  const query = `
    MATCH (s:SubDomain { key: $key })
    DELETE s
  `;
  await dbSession.run(query, { key: subDomainKey });
}

async function dropDatabase(subDomainKey: string) {
  const neo4jDriver = await getDriver();
  const session = neo4jDriver.session();

  try {
    // Drop the Neo4j database
    await session.run(`DROP DATABASE ${subDomainKey} IF EXISTS`);
  } catch (error) {
    console.error(`Failed to drop database ${subDomainKey}:`, error);
    throw new APIError(`Failed to drop database: ${error.message}`, 500);
  } finally {
    await session.close();
  }

  // Wait a moment for the database to be dropped
  await new Promise((resolve) => setTimeout(resolve, 1000));
}

async function deleteSubdomainDirectory(
  subDomainKey: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const baseDir = getBaseDir();
    const subdomainDir = path.join(baseDir, subDomainKey);

    // Check if directory exists
    if (!fs.existsSync(subdomainDir)) {
      return { success: true }; // Directory doesn't exist, nothing to delete
    }

    // Delete directory recursively
    fs.rmSync(subdomainDir, { recursive: true, force: true });

    return { success: true };
  } catch (error) {
    console.error(`Error deleting subdomain directory: ${error}`);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
