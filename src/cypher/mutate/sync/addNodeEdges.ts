// Function to add edges between nodes based on certain conditions.
import type { Session } from "neo4j-driver";

import { int } from "neo4j-driver";

import type { Vertex } from "~/lib/graph/graph";

import { convertNodeToJson } from "~/cypher/convertNodeToJson";
import { findOrCreateNodeAndUpdateProperties } from "~/cypher/mutate/sync/findOrCreateNodeAndUpdateProperties";
import { getChildrenOrParentVertex } from "~/cypher/mutate/sync/getChildrenOrParentVertex";

export async function addNodeEdges(
  sessionSource: Session,
  sessionTarget: Session,
  parentVertex: Vertex,
  superChildrenVertexes: Vertex[],
  type: string,
  outLabel: string,
  inward: boolean,
): Promise<Vertex[]> {
  // Find children with the same name in the target database; if not exists, create a node and edge.
  const userChildrenVertexes = await getChildrenOrParentVertex(
    sessionTarget,
    parentVertex.id,
    type,
    outLabel,
    inward,
  );

  const results: Vertex[] = [];
  const globalCollections = ["DataType", "Comp", "CompCategory"]; // "Nav", "Page"

  for (const superVertex of superChildrenVertexes) {
    const superProperties = { ...superVertex.P };
    let isPropertyExist = false;

    for (const childVertex of userChildrenVertexes) {
      if (superProperties.name === childVertex.P.name) {
        const query = `
          MATCH (a) WHERE id(a) = $childId
          SET a += $props, a.updatedAt = localDateTime()
          RETURN a;
        `;
        const result = await sessionTarget.run(query, {
          childId: int(childVertex.id),
          props: superProperties,
        });
        result.records.forEach((v) =>
          results.push(convertNodeToJson(v.get("a"))),
        );
        isPropertyExist = true;
        break;
      }
    }

    if (!isPropertyExist) {
      let query: string;
      let params: Record<string, any>;

      if (globalCollections.includes(superVertex.L[0])) {
        const targetNode = await findOrCreateNodeAndUpdateProperties(
          sessionSource,
          sessionTarget,
          superVertex,
          superVertex.L[0],
        );
        query = `
          MATCH (a), (b)
          WHERE id(a) = $parentNodeId AND id(b) = $targetNodeId
          CREATE (a)${inward ? "<-" : "-"}[:${type}]${inward ? "-" : "->"}(b)
          RETURN b;
        `;
        params = {
          parentNodeId: int(parentVertex.id),
          targetNodeId: int(targetNode.id),
        };
      } else {
        query = `
          MATCH (a) WHERE id(a) = $parentNodeId
          CREATE (a)${inward ? "<-" : "-"}[:${type}]${inward ? "-" : "->"}(b:${superVertex.L[0]})
          SET b = $props, b.createdAt = localDateTime()
          RETURN b;
        `;
        params = {
          parentNodeId: int(parentVertex.id),
          props: superProperties,
        };
      }

      const result = await sessionTarget.run(query, params);
      result.records.forEach((v) =>
        results.push(convertNodeToJson(v.get("b"))),
      );
    }
  }

  return results;
}
