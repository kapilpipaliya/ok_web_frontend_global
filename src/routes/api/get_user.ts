import type { APIEvent } from "@solidjs/start/dist/server";

import { type Node, type Session, int } from "neo4j-driver";

import { convertNodeToJson } from "~/cypher/convertNodeToJson";
import { getDriver } from "~/cypher/driver";
import { getHttpsSession } from "~/server/getHttpsSession";
import { getSubDomain } from "~/server/getSubDomain";

async function getSubdomainFromRequest(request: Request): Promise<string> {
  const host = request.headers.get("host");
  if (!host) throw new Error("Host header is missing");
  return getSubDomain(host);
}

async function getUserEmailFromSession(): Promise<string> {
  const httpSession = await getHttpsSession();
  if (!httpSession.data.email) {
    throw new Error("Not Authorized: Email is undefined");
  }
  return httpSession.data.email;
}

async function findUserByEmail(session: Session, email: string): Promise<{ roles: Node[], user: Node | null, userSetting: Node | null }> {
  const query = `
    MATCH (u:User)
    WHERE u.email = $email OR u.username = $email
    OPTIONAL MATCH (u)-[:UserSetting]->(s:UserSetting)
    OPTIONAL MATCH (u)-[:UserRole]->(r:Role)
    RETURN u, s, collect(r) AS roles
  `;
  const result = await session.run(query, { email });
  const user = result.records.length > 0 ? result.records[0].get("u") as Node : null;
  const roles = result.records.length > 0 ? result.records[0].get("roles") as Node[] : [];
  let userSetting = result.records.length > 0 ? result.records[0].get("s") as Node : null;

  if (user && !userSetting) {
    // Create a new UserSetting if it doesn't exist
    const createUserSettingQuery = `
      MATCH (u:User)
      WHERE ID(u) = $userId
      CREATE (u)-[:UserSetting]->(s:UserSetting { createdAt: localDateTime() })
      RETURN s
    `;
    const createResult = await session.run(createUserSettingQuery, { userId: int(user.identity) });
    userSetting = createResult.records.length > 0 ? createResult.records[0].get("s") as Node : null;
  }

  return { roles, user, userSetting };
}

export async function GET({ request }: APIEvent) {
  let neo4jSession: Session | undefined;
  try {
    const subdomainFromUrl = await getSubdomainFromRequest(request);
    neo4jSession = (await getDriver(subdomainFromUrl)).session();

    const email = await getUserEmailFromSession();
    const { roles, user, userSetting } = await findUserByEmail(neo4jSession, email);

    if (!user) {
      return new Response(JSON.stringify({ error: `Not Authorized: No user found with email or username ${email}` }), { status: 401 });
    }

    const userVertex = convertNodeToJson(user);
    delete userVertex.P.password;

    const response: any = { user: userVertex };

    if (userSetting) {
      response.userSetting = convertNodeToJson(userSetting);
    }
    if (roles.length > 0) {
      response.roles = roles.map((role) => convertNodeToJson(role));
    }

    return new Response(JSON.stringify(response), { status: 200 });
  } catch (error: unknown) {
    return new Response(error instanceof Error ? error.message : "Unknown error", { status: 500 });
  } finally {
    if (neo4jSession) neo4jSession.close();
  }
}
