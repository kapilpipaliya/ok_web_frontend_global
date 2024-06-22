// Function to find an existing node by name.
import type {Session} from "neo4j-driver";
import {convertNodeToJson} from "~/lib/convertNodeToJson";

export async function findExistingNode(
  session: Session,
  nodeType: string,
  name: string,
) {
  const result = await session.run(
    `MATCH (n:${nodeType} {name: $name}) RETURN n;`,
    {name: name},
  );
  return result.records.length > 0 ? convertNodeToJson(result.records[0].get("n")) : null;
}