import type { Store } from "solid-js/store";

import type { GraphInterface, Vertex, VertexMap } from "~/lib/graph/graph";

import { getSelectionOptions } from "./getSelectionOptions";

export function getNameKeyForCollection(
  graph: Store<GraphInterface>,
  collVertex: Vertex,
): string[] {
  const pks =
    getSelectionOptions(graph, () => 0, "->$0NameKey", [collVertex]).vertexes ||
    [];
  return pks.map((pk: VertexMap) => pk.P.key);
}
