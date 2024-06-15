import type { Store } from "solid-js/store";
import { type GraphInterface, IdAttr, type Vertex } from "~/lib/graph/graph";
import {
  getAttrVertex
} from "~/components/page_attr_render/utils/getAttrVertex";

export function getAttr(
 graph: Store<GraphInterface>,
 item?: Vertex
): string | undefined {
 return item && getAttrVertex(graph, item)?.P[IdAttr];
}