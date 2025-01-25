import type { Store } from "solid-js/store";

import type { GraphInterface, Vertex } from "~/lib/graph/graph";

import { getSelectionOptions } from "./getSelectionOptions";

export function getPkForCollection(
  graph: Store<GraphInterface>,
  collVertex: Vertex,
) {
  const pks =
    getSelectionOptions(graph, () => 0, "->$0Pk", [collVertex]).vertexes || [];
  return pks.map((pk: Vertex) => pk.P.key);
}
