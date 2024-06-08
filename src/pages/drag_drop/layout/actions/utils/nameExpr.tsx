import { GraphInterface, Vertex } from "~/lib/graph/graph";
import { Store } from "solid-js/store";
import { getChildVertex } from "~/lib/graph/get/sync/traverse";

export function nameExpr(v: Vertex, graph: Store<GraphInterface>) {
 const component = getChildVertex(graph, ["$0Comp"], v).vertex?.P.name;
 return `${v.P.name}${component ? ` (${component})` : ""}`;
}