import type { GraphInterface, Vertex } from "~/lib/graph/graph";

import { evalExpression } from "~/lib/expression_eval";

export function getComponentLabel(
  graph: GraphInterface,
  vertex: Vertex,
): string | undefined {
  const vertexes = evalExpression("->$0Comp", {
    graph,
    vertexes: [vertex],
  });

  return vertexes?.[0]?.P.key || vertex.P.componentName || "Html";
}
