import type { GraphInterface, Vertex } from "~/lib/graph/graph";

import { evalExpression } from "~/lib/expression_eval";

export function getCompChildren(vertex: Vertex, graph: GraphInterface) {
  if (!vertex) {
    return [];
  }
  const children: Vertex[] =
    evalExpression("<-ParentComp", { graph, vertexes: [vertex] }) || [];
  return children;
}
