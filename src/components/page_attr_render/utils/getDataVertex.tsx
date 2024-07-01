import type { Store } from "solid-js/store";

import type { GraphInterface, Vertex } from "~/lib/graph/graph";

import { getChildVertex } from "~/lib/graph/get/sync/traverse";

export function getDataVertex(
 graph: Store<GraphInterface>,
 item?: Vertex
) {
 return item && getChildVertex(graph, ["$0Data"], item).vertex;
}