import { getChildVertexes } from "./traverse";
import type { Store } from "solid-js/store";
import type { GraphInterface, Vertex } from "~/lib/graph/graph";


export function getNameKeyForCollection(
  graph: Store<GraphInterface>,
  collVertex: Vertex
) {
  const pks = getChildVertexes(graph, ["$0NameKey"], [collVertex]).vertexes || [];
  return pks.map((pk) => pk.P.name);
}
