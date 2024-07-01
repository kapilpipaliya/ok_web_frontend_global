// Function to update properties of an existing node.
import type {Session} from "neo4j-driver";

import {int} from "neo4j-driver";

import type {Vertex} from "~/lib/graph/graph";

import {convertNodeToJson} from "~/lib/convertNodeToJson";

export async function updateNodeProperties(
  session: Session,
  node: Vertex,
  properties: { [key: string]: any },
) {
  const result = await session.run(
    "MATCH (n) WHERE id(n) = $id SET n += $properties SET n.updatedAt = localDateTime() RETURN n;",
    {id: int(node.id), properties},
  );
  return convertNodeToJson(result.records[0].get("n"));
}