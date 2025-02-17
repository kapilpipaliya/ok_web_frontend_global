// refactor this file
import type { Store } from "solid-js/store";

import type { GraphInterface, Vertex } from "~/lib/graph/graph";

export function getCollection(
  _graph: Store<GraphInterface>,
  item?: Vertex,
): string | undefined {
  return item?.P.collection;
}
