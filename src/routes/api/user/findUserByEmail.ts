import { int, type Node, type Session } from "neo4j-driver";

import type { Vertex } from "~/lib/graph/graph";

import { convertNodeToJson } from "~/cypher/convertNodeToJson";

export async function findUserByEmail(
  session: Session,
  email: string,
): Promise<{
  globalTheme: null | Vertex;
  roles: Vertex[];
  user: null | Vertex;
  userSetting: null | Vertex;
}> {
  const query = `
      MATCH (u:User)
      WHERE u.email = $email OR u.username = $email
      OPTIONAL MATCH (u)-[:UserSetting]->(s:UserSetting)
      OPTIONAL MATCH (u)-[:UserRole]->(r:Role)
      RETURN u, s, collect(r) AS roles
    `;
  const result = await session.run(query, { email });
  const user =
    result.records.length > 0
      ? convertNodeToJson(result.records[0].get("u") as Node)
      : null;
  const roles =
    result.records.length > 0
      ? result.records[0]
          .get("roles")
          .map((role: Node) => convertNodeToJson(role))
      : [];
  let userSetting =
    result.records.length > 0
      ? convertNodeToJson(result.records[0].get("s") as Node)
      : null;

  if (user && !userSetting) {
    userSetting = await createUserSetting(session, user.id);
  }

  const globalTheme = await getOrCreateGlobalTheme(session);

  return { globalTheme, roles, user, userSetting };
}

async function createUserSetting(
  session: Session,
  userId: string,
): Promise<null | Vertex> {
  const createUserSettingQuery = `
      MATCH (u:User)
      WHERE ID(u) = $userId
      CREATE (u)-[:UserSetting]->(s:UserSetting { createdAt: localDateTime() })
      RETURN s
    `;
  const createResult = await session.run(createUserSettingQuery, {
    userId: int(userId),
  });
  return createResult.records.length > 0
    ? convertNodeToJson(createResult.records[0].get("s") as Node)
    : null;
}

async function getOrCreateGlobalTheme(
  session: Session,
): Promise<null | Vertex> {
  const globalThemeQuery = `
      MATCH (t:GlobalTheme)
      RETURN t
    `;
  const globalThemeResult = await session.run(globalThemeQuery);
  if (globalThemeResult.records.length > 0) {
    return convertNodeToJson(globalThemeResult.records[0].get("t") as Node);
  }
    const createGlobalThemeQuery = `
        CREATE (t:GlobalTheme { createdAt: localDateTime() })
        RETURN t
      `;
    const createGlobalThemeResult = await session.run(createGlobalThemeQuery);
    return createGlobalThemeResult.records.length > 0
      ? convertNodeToJson(createGlobalThemeResult.records[0].get("t") as Node)
      : null;
}
