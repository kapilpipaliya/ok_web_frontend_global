import type { Vertex } from "~/lib/graph/graph";

import { uniqueNameKey } from "../../constant";

export function nameExpr(v: Vertex, componentName: string) {
  return `${componentName ? ` ${componentName}` : ""}${v.P[uniqueNameKey] ? ` (${v.P[uniqueNameKey]})` : ""}`;
  //  return `${componentName ? ` ${componentName}` : ""}`;
}
