import type { Session } from "neo4j-driver";

import jsep from "jsep";

import type { NestedExpression } from "~/cypher/get/NestedExpression";
import type { EdgeMap, Vertex, VertexMap } from "~/lib/graph/graph";

import { addNodeEdges } from "~/cypher/mutate/sync/addNodeEdges";
import { evalAsync } from "~/lib/expression_eval";

import { findOrCreateNodeAndUpdateProperties } from "./findOrCreateNodeAndUpdateProperties";

export async function processNodeSync(
  sessionSource: Session,
  sessionTarget: Session,
  expression: NestedExpression,
  vertexes: Vertex[],
  inward: boolean,
  createdVertex?: Vertex
): Promise<{ graph: { edges: EdgeMap; vertexes: VertexMap }; result: Vertex[] }> {
  const context = {
    nodes: {} as VertexMap,
    relationships: {} as EdgeMap,
    session: sessionSource,
    setChildren: true,
    vertexes,
  };

  const mainResult = await evalAsync(jsep(expression.expression), context);

  if (!mainResult || mainResult.length === 0) {
    return { graph: { edges: context.relationships, vertexes: context.nodes }, result: mainResult };
  }

  let children: Vertex[] = [];
  if (createdVertex) {
    const edgeType = Object.values(context.relationships)[0]?.T;
    const outLabel = mainResult[0]?.L[0];
    if (edgeType && outLabel) {
      children = await addNodeEdges(
        sessionSource,
        sessionTarget,
        createdVertex,
        mainResult,
        edgeType,
        outLabel,
        inward
      );
    }
  }

  for (const vertex of mainResult) {
    const newCreatedVertex =
      children.find((child) => child.P.name === vertex.P.name) ||
      (await findOrCreateNodeAndUpdateProperties(
        sessionSource,
        sessionTarget,
        vertex,
        vertex.L[0]
      ));

    if (expression.incoming && expression.incoming.length > 0) {
      for (const exp of expression.incoming) {
        await processNodeSync(
          sessionSource,
          sessionTarget,
          exp,
          [vertex],
          true,
          newCreatedVertex
        );
      }
    }

    if (expression.outgoing && expression.outgoing.length > 0) {
      for (const exp of expression.outgoing) {
        await processNodeSync(
          sessionSource,
          sessionTarget,
          exp,
          [vertex],
          false,
          newCreatedVertex
        );
      }
    }
  }

  return {
    graph: {
      edges: context.relationships,
      vertexes: context.nodes,
    },
    result: mainResult,
  };
}
