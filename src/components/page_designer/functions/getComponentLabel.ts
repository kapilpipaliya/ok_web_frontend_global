import type { GraphInterface, Vertex } from "~/lib/graph/graph";

import { evalExpression } from "~/lib/expression_eval";

export function getComponentName(componentVertex: Vertex, attrVertex: Vertex): string {
  return componentVertex?.P.key || attrVertex.P.componentName || "Html";
}

export function getComponentLabel(
  graph: GraphInterface, 
  vertex: Vertex,
): string | undefined {
  const vertexes = evalExpression("->$0Comp", {
    graph,
    vertexes: [vertex],
  });

  return getComponentName(vertexes?.[0], vertex);
}
