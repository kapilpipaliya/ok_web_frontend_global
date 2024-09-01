// Function to add edges between nodes based on certain conditions.
import type { Session } from "neo4j-driver";

import { int } from "neo4j-driver";

import type { Vertex } from "~/lib/graph/graph";

import { convertNodeToJson } from "~/cypher/convertNodeToJson";
import { findOrCreateNodeAndUpdateProperties } from "~/cypher/mutate/sync/findOrCreateNodeAndUpdateProperties";
import { getChildrenOrParentVertex } from "~/cypher/mutate/sync/getChildrenOrParentVertex";

import { globalCollections } from "./constants/globalCollections";

export async function addNodeEdges(
  sessionSource: Session,
  sessionTarget: Session,
  parentVertex: Vertex,
  superChildrenVertexes: Vertex[],
  type: string,
  outLabel: string,
  inward: boolean,
): Promise<Vertex[]> {
  // Find children with the same key in the target database; if not exists, create a node and edge.
  const userChildrenVertexes = await getChildrenOrParentVertex(
    sessionTarget,
    parentVertex.id,
    type,
    outLabel,
    inward,
  );

  const results: Vertex[] = [];

  for (const superVertex of superChildrenVertexes) {
    const existingChild = userChildrenVertexes.find(
      (childVertex) => superVertex.P.key === childVertex.P.key,
    );

    if (existingChild) {
      const query = `
        MATCH (a) WHERE id(a) = $childId
        SET a += $props, a.updatedAt = localDateTime()
        RETURN a;
      `;
      const result = await sessionTarget.run(query, {
        childId: int(existingChild.id),
        props: superVertex.P,
      });
      result.records.forEach((v) =>
        results.push(convertNodeToJson(v.get("a"))),
      );
    } else {
      const isGlobalCollection = globalCollections.includes(superVertex.L[0]);
      const targetNode = isGlobalCollection
        ? await findOrCreateNodeAndUpdateProperties(
            sessionSource,
            sessionTarget,
            superVertex,
            superVertex.L[0],
          )
        : null;

      const query = isGlobalCollection
        ? `
          MATCH (a), (b)
          WHERE id(a) = $parentNodeId AND id(b) = $targetNodeId
          CREATE (a)${inward ? "<-" : "-"}[:${type}]${inward ? "-" : "->"}(b)
          RETURN b;
        `
        : `
          MATCH (a) WHERE id(a) = $parentNodeId
          CREATE (a)${inward ? "<-" : "-"}[:${type}]${inward ? "-" : "->"}(b:${superVertex.L[0]})
          SET b = $props, b.createdAt = localDateTime()
          RETURN b;
        `;

      const params = isGlobalCollection
        ? {
            parentNodeId: int(parentVertex.id),
            targetNodeId: int(targetNode!.id),
          }
        : {
            parentNodeId: int(parentVertex.id),
            props: superVertex.P,
          };

      const result = await sessionTarget.run(query, params);
      result.records.forEach((v) =>
        results.push(convertNodeToJson(v.get("b"))),
      );
    }
  }

  return results;
}
