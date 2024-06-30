import type { GraphInterface, Vertex } from "~/lib/graph/graph";
import type { Store } from "solid-js/store";

export function getID(item?: Vertex): string | undefined {
 return item?.P.name;
}

export function getId(
 graph: Store<GraphInterface>,
 item?: Vertex
): string | undefined {
  return getID(item) || "";
}