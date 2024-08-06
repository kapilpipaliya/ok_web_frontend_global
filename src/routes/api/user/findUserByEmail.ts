import { int, type Node, type Session } from "neo4j-driver";

export async function findUserByEmail(session: Session, email: string): Promise<{ roles: Node[], user: Node | null, userSetting: Node | null }> {
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