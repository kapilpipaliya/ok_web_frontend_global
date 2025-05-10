import type { APIEvent } from "@solidjs/start/server";
import type { Session } from "neo4j-driver";

import { convertNodeToJson } from "~/cypher/conversion/convertNodeToJson";
import { SYSTEM_DB_NAME } from "~/cypher/core/boltConstant";
import { createActivityLog } from "~/cypher/mutate/activity/createActivityLog";
import { getAllDatabases } from "~/cypher/mutate/manage/getAllDatabases";
import { subdomainRegister } from "~/cypher/mutate/signup/subdomainRegister";
import { checkRole } from "~/cypher/permissions/isPermission";
import { SYSTEM_ROLES } from "~/cypher/permissions/type/types";
import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import { APIError, handleAPIError } from "~/lib/api/server/apiErrorHandler";
import { validateDatabaseName } from "~/lib/validation/validateDatabaseName";
import { getUserFromSession } from "~/server/auth/session/getUserFromSession";

export async function POST({ request }: APIEvent) {
  const { dbSession, subDomain } = await getDBSessionForSubdomain(request);
  try {
    if (subDomain !== SYSTEM_DB_NAME) {
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

    const { domain, key } = await request.json();

    // Get the user's account
    const accountResult = await dbSession.run(
      `
      MATCH (a:Account)-[:AccountUser]->(u:User {uuid: $uuid})
      RETURN a
    `,
      { uuid: user.P.uuid },
    );

    if (accountResult.records.length === 0) {
      throw new APIError("Account not found", 404);
    }

    const account = convertNodeToJson(accountResult.records[0].get("a"));

    const databaseNameError = validateDatabaseName(key);
    if (databaseNameError) {
      throw new APIError(databaseNameError, 400);
    }

    await validateKeyAndDomain(dbSession, key, domain);
    const databases = await getAllDatabases();
    if (databases.includes(key)) {
      throw new APIError("Subdomain with this key already exists", 400);
    }
    const newSubdomain = await createSubdomain(dbSession, key, domain);

    // Create AccountSubdomain relationship
    await createAccountSubdomainRelation(
      dbSession,
      account.id,
      newSubdomain.id,
    );

    await createActivityLog(
      dbSession,
      "subdomain_create",
      "SubDomain",
      newSubdomain.id,
      user.P.email,
      `Created subdomain ${key} with domain ${domain}`,
    );

    // @ts-expect-error ignore
    await subdomainRegister(dbSession, {
      ...user.P,
      password: "",
      subDomain: key,
    });

    return {
      graph: {
        edges: {},
        vertexes: { [newSubdomain.id]: newSubdomain },
      },
      result: newSubdomain,
    };
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}

async function createAccountSubdomainRelation(
  dbSession: Session,
  accountId: string,
  subdomainId: string,
) {
  await dbSession.run(
    `
    MATCH (a:Account), (s:SubDomain)
    WHERE elementId(a) = $accountId AND elementId(s) = $subdomainId
    CREATE (a)-[:AccountSubdomain]->(s)
  `,
    {
      accountId,
      subdomainId,
    },
  );
}

async function createSubdomain(
  dbSession: Session,
  key: string,
  domain: string,
) {
  const result = await dbSession.run(
    `CREATE (s:SubDomain {
      key: $key,
      domain: $domain,
      status: "active",
      createdAt: datetime(),
      lastModified: datetime()
    }) RETURN s`,
    { domain: domain ?? "", key },
  );
  return convertNodeToJson(result.records[0]?.get("s"));
}

async function validateKeyAndDomain(
  dbSession: Session,
  key: string,
  domain: string,
) {
  const existingKey = await dbSession.run(
    "MATCH (s:SubDomain {key: $key}) RETURN s",
    { key },
  );
  if (existingKey.records.length > 0) {
    throw new APIError("Subdomain with this key already exists", 400);
  }

  if (domain) {
    const existingDomain = await dbSession.run(
      "MATCH (s:SubDomain {domain: $domain}) RETURN s",
      { domain },
    );
    if (existingDomain.records.length > 0) {
      throw new APIError("Domain name is already taken", 400);
    }
  }
}
