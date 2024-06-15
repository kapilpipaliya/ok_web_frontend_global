// refactor this file
import { Store } from "solid-js/store";
import { GraphInterface, IdAttr, Vertex } from "~/lib/graph/graph";
import { getChildVertex } from "~/lib/graph/get/sync/traverse";

export function getCollection(
 graph: Store<GraphInterface>,
 item?: Vertex
): string | undefined {
 return item && getChildVertex(graph, ["$0Coll"], item).vertex?.P[IdAttr];
}