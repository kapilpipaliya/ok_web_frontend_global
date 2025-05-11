import { evalExpression } from "~/lib/expression_eval";
import type { Vertex } from "~/lib/graph/type/vertex";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

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
