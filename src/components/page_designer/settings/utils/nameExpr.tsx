import type { Store } from "solid-js/store";

import type { GraphInterface, Vertex } from "~/lib/graph/graph";

import { getChildVertex } from "~/lib/graph/get/sync/traverse";

export function nameExpr(v: Vertex, graph: Store<GraphInterface>) {
 const component = getChildVertex(graph, ["$0Comp"], v).vertex?.P.name;
 return `${component ? ` ${component}` : ""}${v.P.name ? ` (${v.P.name})` : ""}`;
//  return `${component ? ` ${component}` : ""}`;
}