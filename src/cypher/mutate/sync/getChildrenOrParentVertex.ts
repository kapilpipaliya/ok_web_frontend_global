// Function to retrieve child vertices of a node based on a specific edge type.
import type {Session} from "neo4j-driver";

import {int} from "neo4j-driver";

import {convertNodeToJson} from "~/lib/convertNodeToJson";

export async function getChildrenOrParentVertex(session: Session, id: string, edgeType: string, endLabel: string, inward: boolean) {
  const result = await session.run(
    !inward ? `MATCH (n)-[r:${edgeType}]->(m:${endLabel}) WHERE id(n) = $id RETURN m;` : `MATCH (n${endLabel})<-[r:${edgeType}]-(m) WHERE id(n) = $id RETURN m;`,
    {id: int(id)},
  );
  return result.records.map(v => convertNodeToJson(v.get('m')))
}