import type { Vertex } from "~/lib/graph/graph";

export function nameExpr(v: Vertex, componentName: string) {
  // return `${componentName ? ` ${componentName}` : ""}${v.P[uniqueNameKey] ? ` (${v.P[uniqueNameKey]})` : ""}`;
  return `${componentName ? ` ${componentName}` : ""}${v.P.attrLabel ? ` (${v.P.attrLabel})` : ""}`;

  //  return `${componentName ? ` ${componentName}` : ""}`;
}
