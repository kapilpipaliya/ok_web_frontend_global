import type { Node, Session } from "neo4j-driver";
import type { CollectedData } from "../types";

export async function fetchAttrHierarchy(
  dbSession: Session,
  parentNode: Node,
  parentType: "Component" | "Page",
): Promise<CollectedData> {
  const parentId = parentNode.elementId;

  const result = await dbSession.run(
    `
    MATCH (parent:${parentType})
    WHERE elementId(parent) = $parentId
    OPTIONAL MATCH (parent)-[attrRel:Attr]->(attr:Attr)
    OPTIONAL MATCH path = (attr)-[:Attr*]->(descendant:Attr)
    RETURN 
      collect(DISTINCT attr) as attrs,
      collect(DISTINCT attrRel) as attrRels,
      reduce(acc = [], p in collect(path) | acc + nodes(p)) as descendants,
      reduce(acc = [], p in collect(path) | acc + relationships(p)) as descendantRels
  `,
    { parentId },
  );

  if (result.records.length === 0) {
    return { vertices: [], edges: [] };
  }

  const record = result.records[0];
  const vertices = [
    ...(record.get("attrs") || []),
    ...(record.get("descendants") || []),
  ].filter(Boolean);

  const edges = [
    ...(record.get("attrRels") || []),
    ...(record.get("descendantRels") || []),
  ].filter(Boolean);

  return { vertices, edges };
}
