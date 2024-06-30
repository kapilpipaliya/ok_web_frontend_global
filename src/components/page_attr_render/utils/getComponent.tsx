import type { Store } from "solid-js/store";
import type { GraphInterface, Vertex } from "~/lib/graph/graph";
import { getChildVertex } from "~/lib/graph/get/sync/traverse";

import { getCompFallbackToString } from "~/lib/graph/get/sync/getCompFallbackToString";

export function getComponent(
 graph: Store<GraphInterface>,
 item?: Vertex
): Vertex | undefined {
 if (!item) return;

 const currentComp = getChildVertex(graph, ["$0Comp"], item).vertex;
 if (currentComp) return currentComp;


 return getCompFallbackToString(item, graph);
}