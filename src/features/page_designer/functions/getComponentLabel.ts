import type { Vertex } from "~/lib/graph/graph";
import type { GraphInterface } from "~/lib/graph/GraphContext";

import { evalExpression } from "~/lib/expression_eval";

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

export function getComponentName(
  componentVertex: Vertex,
  attrVertex: Vertex,
): string {
  return componentVertex?.P.key || attrVertex.P.componentName || "Html";
}
