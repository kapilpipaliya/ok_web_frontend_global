import type { Vertex } from "~/lib/graph/graph";
import type { GraphInterface } from "~/lib/graph/GraphContext";

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
