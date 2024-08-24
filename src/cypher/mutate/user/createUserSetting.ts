import type { Node, Session } from "neo4j-driver";

import { int } from "neo4j-driver";

import type { Vertex } from "~/lib/graph/graph";

import { convertNodeToJson } from "~/cypher/convertNodeToJson";

export async function createUserSetting(
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
