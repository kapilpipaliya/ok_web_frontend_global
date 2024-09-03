import type { Node, Session } from "neo4j-driver";

import type { Vertex } from "~/lib/graph/graph";

import { convertNodeToJson } from "~/cypher/convertNodeToJson";

export async function getOrCreateGlobalTheme(
  dbSession: Session,
): Promise<null | Vertex> {
  const globalThemeQuery = `
      MATCH (t:GlobalTheme)
      RETURN t
    `;
  const globalThemeResult = await dbSession.run(globalThemeQuery);
  if (globalThemeResult.records.length > 0) {
    return convertNodeToJson(globalThemeResult.records[0].get("t") as Node);
  }
  const createGlobalThemeQuery = `
        CREATE (t:GlobalTheme { createdAt: localDateTime() })
        RETURN t
      `;
  const createGlobalThemeResult = await dbSession.run(createGlobalThemeQuery);
  return createGlobalThemeResult.records.length > 0
    ? convertNodeToJson(createGlobalThemeResult.records[0].get("t") as Node)
    : null;
}
