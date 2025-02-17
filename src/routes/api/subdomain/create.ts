import type { APIEvent } from "@solidjs/start/dist/server";
import type { Session } from "neo4j-driver";

import { convertNodeToJson } from "~/cypher/convertNodeToJson";
import { getDBSessionForSubdomain } from "~/cypher/get/getSessionForSubdomain";
import { createActivityLog } from "~/cypher/mutate/activity/createActivityLog";
import { subdomainRegister } from "~/cypher/mutate/signup/subdomainRegister";
import { findUserByEmailSimple } from "~/cypher/mutate/user/findUserByEmail";
import { getUserFromSession } from "~/server/session/getUserFromSession";

export async function POST({ request }: APIEvent) {
  const { domain, key } = await request.json();
  const { dbSession } = await getDBSessionForSubdomain(request);

  try {
    const user = await validateUser(
      (await getUserFromSession(request))?.P.email,
      dbSession,
    );
    await checkExistingDomain(dbSession, key, domain);
    const newSubdomain = await createSubdomain(dbSession, key, domain);
    await createActivityLog(
      dbSession,
      "SESSION_CREATE",
      "SubDomain",
      newSubdomain.id,
      user.P.email,
      `Created subdomain ${key} with domain ${domain}`,
    );
    await createUserSubdomainRelation(dbSession, key, user.P.uuid);
    // @ts-expect-error ignore
    await subdomainRegister(dbSession, {
      ...user.P,
      password: "",
      subDomain: key,
    });

    return { subdomain: newSubdomain, success: true };
  } catch (error) {
    return new Response(
      JSON.stringify({
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      }),
      {
        headers: { "Content-Type": "application/json" },
        status:
          error instanceof Error && error.message === "Unauthorized"
            ? 401
            : 500,
      },
    );
  } finally {
    await dbSession.close();
  }
}

async function checkExistingDomain(
  dbSession: Session,
  key: string,
  domain: string,
) {
  const existingKey = await dbSession.run(
    "MATCH (s:SubDomain {key: $key}) RETURN s",
    { key },
  );
  if (existingKey.records.length > 0) {
    throw new Error("Subdomain with this key already exists");
  }

  const existingDomain = await dbSession.run(
    "MATCH (s:SubDomain {domain: $domain}) RETURN s",
    { domain },
  );
  if (existingDomain.records.length > 0) {
    throw new Error("Domain name is already taken");
  }
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
    { domain, key },
  );
  return convertNodeToJson(result.records[0]?.get("s"));
}

async function createUserSubdomainRelation(
  dbSession: Session,
  key: string,
  userUuid: string,
) {
  await dbSession.run(
    `MATCH (u:User { uuid: $uuid }), (s:SubDomain { key: $key })
     CREATE (u)-[:UserSubDomain]->(s)`,
    { key, uuid: userUuid },
  );
}

async function validateUser(email: null | string, dbSession: Session) {
  if (!email) {
    throw new Error("Unauthorized");
  }
  const user = await findUserByEmailSimple(dbSession, email);
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}
