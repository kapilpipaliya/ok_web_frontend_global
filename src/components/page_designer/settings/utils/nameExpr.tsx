import type { GraphInterface, Vertex } from "~/lib/graph/graph";

export function nameExpr(v: Vertex, componentName: string, graph: GraphInterface) {
  if (componentName === "Component") {
    const componentId = v.P.componentId;
    if (!componentId) return componentName;
    const componentVertex = graph.vertexes[componentId];
    return `${componentName}${componentVertex?.P.key ? ` [${componentVertex.P.key}]` : ""}`;
  }
  return `${componentName ? ` ${componentName}` : ""}${v.P.attrLabel ? ` (${v.P.attrLabel})` : ""}`;
}
