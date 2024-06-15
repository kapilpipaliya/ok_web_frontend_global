import type { Store } from "solid-js/store";
import type { GraphInterface, Vertex } from "~/lib/graph/graph";
import { getChildVertex } from "~/lib/graph/get/sync/traverse";

import { getCollAttrComp } from "~/lib/graph/get/sync/graph_functions";
import {
 getAttrVertex
} from "~/components/page_attr_render/utils/getAttrVertex";

export function getComponent(
 graph: Store<GraphInterface>,
 item?: Vertex
): Vertex | undefined {
 if (!item) return;

 const currentComp = getChildVertex(graph, ["$0Comp"], item).vertex;
 if (currentComp) return currentComp;

 const attrVertex = getAttrVertex(graph, item);
 if (!attrVertex) return;
 return getCollAttrComp(attrVertex, graph);
}