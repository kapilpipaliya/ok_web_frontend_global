// refactor this file
import type { Store } from "solid-js/store";
import { type GraphInterface, IdAttr, type Vertex } from "~/lib/graph/graph";
import { getChildVertex } from "~/lib/graph/get/sync/traverse";

export function getCollection(
 graph: Store<GraphInterface>,
 item?: Vertex
): string | undefined {
 return item && getChildVertex(graph, ["$0Coll"], item).vertex?.P[IdAttr];
}