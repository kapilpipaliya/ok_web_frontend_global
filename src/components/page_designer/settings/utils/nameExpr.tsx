import type { Vertex } from "~/lib/graph/graph";

export function nameExpr(v: Vertex, component: string) {
 return `${component ? ` ${component}` : ""}${v.P.name ? ` (${v.P.name})` : ""}`;
//  return `${component ? ` ${component}` : ""}`;
}