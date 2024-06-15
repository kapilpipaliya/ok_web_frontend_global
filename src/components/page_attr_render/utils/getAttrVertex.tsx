import { Store } from "solid-js/store";
import { GraphInterface, Vertex } from "~/lib/graph/graph";
import { getChildVertex } from "~/lib/graph/get/sync/traverse";

export function getAttrVertex(
 graph: Store<GraphInterface>,
 item?: Vertex
): Vertex | undefined {
 return item && getChildVertex(graph, ["$0Att"], item).vertex;
}