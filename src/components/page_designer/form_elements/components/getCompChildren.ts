import type { GraphInterface, Vertex } from "~/lib/graph/graph";

import { evalExpression } from "~/lib/expression_eval";

export function getCompChildren(
  vertex: Vertex[],
  edgeName: string,
  graph: GraphInterface,
) {
  if (!vertex) {
    return [];
  }
  const children: Vertex[] =
    evalExpression(`<-${edgeName}`, { graph, vertexes: vertex }) || [];
  return children;
}
