import type { Node, Session } from "neo4j-driver";

import type { Vertex } from "~/lib/graph/graph";

import { convertNodeToJson } from "~/cypher/convertNodeToJson";

import { createUserSetting } from "./createUserSetting";

interface UserResult {
  globalTheme: null | Vertex;
  roles: Vertex[];
  user: null | Vertex;
  userSetting: null | Vertex;
}

export async function findUserByEmail(
  dbSession: Session,
  email: string,
): Promise<UserResult> {
  const query = `
    MATCH (u:User)
    WHERE u.email = $email OR u.username = $email
    OPTIONAL MATCH (u)-[:UserSetting]->(s:UserSetting)
    OPTIONAL MATCH (u)-[:UserRole]->(r:Role)
    RETURN u, s, collect(r) AS roles
  `;

  const result = await dbSession.run(query, { email });

  if (result.records.length === 0) {
    throw new Error(`User with email or username "${email}" not found.`);
  }

  const record = result.records[0];
  const user = convertNodeToJson(record.get("u") as Node);
  const roles =
    (record.get("roles") as Node[] | null)?.map((role) =>
      convertNodeToJson(role),
    ) || [];
  let userSetting = record.get("s")
    ? convertNodeToJson(record.get("s") as Node)
    : null;

  if (user && !userSetting) {
    userSetting = (await createUserSetting(dbSession, user.id)) as Vertex;
  }

  return {
    roles,
    user,
    userSetting,
  };
}
