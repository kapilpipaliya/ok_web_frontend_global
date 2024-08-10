import type { Node, Session } from "neo4j-driver";

import type { Vertex } from "~/lib/graph/graph";

import { convertNodeToJson } from "~/cypher/convertNodeToJson";
import { createUserSetting } from "~/routes/api/user/createUserSetting";
import { getOrCreateGlobalTheme } from "~/cypher/mutate/user/getOrCreateGlobalTheme";

interface UserResult {
  globalTheme: null | Vertex;
  roles: Vertex[];
  user: null | Vertex;
  userSetting: null | Vertex;
}

export async function findUserByEmail(
  session: Session,
  email: string
): Promise<UserResult> {
  const query = `
    MATCH (u:User)
    WHERE u.email = $email OR u.username = $email
    OPTIONAL MATCH (u)-[:UserSetting]->(s:UserSetting)
    OPTIONAL MATCH (u)-[:UserRole]->(r:Role)
    RETURN u, s, collect(r) AS roles
  `;
  
  const result = await session.run(query, { email });

  if (result.records.length === 0) {
    throw new Error(`User with email or username "${email}" not found.`);
  }

  const record = result.records[0];
  const user = convertNodeToJson(record.get("u") as Node);
  const roles = (record.get("roles") as Node[]).map((role) => convertNodeToJson(role));
  let userSetting = convertNodeToJson(record.get("s") as Node);

  if (user && !userSetting) {
    userSetting = await createUserSetting(session, user.id) as Vertex;
  }

  return {
    globalTheme: await getOrCreateGlobalTheme(session),
    roles,
    user,
    userSetting,
  };
}
