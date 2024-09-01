// Function to find an existing node by key.
import type { Session } from "neo4j-driver";

import { convertNodeToJson } from "~/cypher/convertNodeToJson";

export async function findExistingNode(
  session: Session,
  nodeType: string,
  key: string,
) {
  const result = await session.run(
    `MATCH (n:${nodeType} {key: $key}) RETURN n;`,
    { key: key },
  );
  return result.records.length > 0
    ? convertNodeToJson(result.records[0].get("n"))
    : null;
}
