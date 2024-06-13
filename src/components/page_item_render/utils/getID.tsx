import { GraphInterface, Vertex } from "~/lib/graph/graph";
import { Store } from "solid-js/store";
import { getAttr } from "~/components/page_item_render/utils/getAttr";

export function getID(item?: Vertex): string | undefined {
 return item?.P.name;
}

export function getId(
 graph: Store<GraphInterface>,
 item?: Vertex
): string | undefined {
  return getAttr(graph, item) || getID(item) || "";
}