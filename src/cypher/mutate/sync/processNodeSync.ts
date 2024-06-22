import type {Session} from "neo4j-driver";
import type {Expression} from "~/cypher/get/getDataMGCall";
import type {EdgeMap, Vertex, VertexMap} from "~/lib/graph/graph";
import {evalAsync} from "~/lib/expression_eval";
import jsep from "jsep";
import {addNodeEdges} from "~/cypher/mutate/sync/addNodeEdges";

export async function processNodeSync(
  sessionSource: Session,
  sessionTarget: Session,
  expression: Expression,
  vertexes: Vertex[],
  inward: boolean,
  createdVertex?: Vertex,
) {
  const context = {
    nodes: {} as VertexMap,
    relationships: {} as EdgeMap,
    vertexes,
    session: sessionSource,
    setChildren: true,
  }
  const mainResult = await evalAsync(jsep(expression.expression), context);

  if (mainResult && mainResult.length > 0) {
    let children: Vertex[] = [];
    if (createdVertex && mainResult.length > 0) {
      const edge = Object.values(context.relationships)[0];
      const outLabel = mainResult[0].L[0];
      children = await addNodeEdges(sessionSource, sessionTarget, createdVertex, mainResult, edge.T, outLabel, inward);
    }

    for (const vertex of mainResult) {
      const newCreatedVertex = children.find(child => child.P.name === vertex.P.name) || await findOrCreateNodeAndUpdateProperties(sessionSource, sessionTarget, vertex, vertex.L[0]);
      if (expression.incoming && expression.incoming.length > 0) {
        for (const exp of expression.incoming) {
          await processNodeSync(sessionSource, sessionTarget, exp, [vertex], true, newCreatedVertex);
        }
      }
      if (expression.outgoing && expression.outgoing.length > 0) {
        for (const exp of expression.outgoing) {
          await processNodeSync(sessionSource, sessionTarget, exp, [vertex], false, newCreatedVertex);

        }
      }
    }
  }

  return {
    result: mainResult,
    graph: {
      vertexes: context.nodes,
      edges: context.relationships,
    },
  };
}