import type { Vertex } from "~/lib/graph/graph";

export function nameExpr(v: Vertex, componentName: string) {
  return `${componentName ? ` ${componentName}` : ""}${v.P.name ? ` (${v.P.name})` : ""}`;
  //  return `${componentName ? ` ${componentName}` : ""}`;
}
