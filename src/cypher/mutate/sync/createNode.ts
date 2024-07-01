// Function to create a new node.
import type {Session} from "neo4j-driver";

import {convertNodeToJson} from "~/lib/convertNodeToJson";

export async function createNode(
  session: Session,
  nodeType: string,
  properties: { [key: string]: any },
) {
  const result = await session.run(
    `CREATE (n:${nodeType}) SET n = $properties SET n.createdAt = localDateTime() RETURN n;`,
    {properties},
  );
  return convertNodeToJson(result.records[0].get("n"));
}