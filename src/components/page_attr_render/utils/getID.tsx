import type { Store } from "solid-js/store";

import type { GraphInterface, Vertex } from "~/lib/graph/graph";

export function getID(item?: Vertex): string | undefined {
  return item?.P.name;
}

export function getId(
  _graph: Store<GraphInterface>,
  item?: Vertex,
): string | undefined {
  return getID(item) || "";
}
