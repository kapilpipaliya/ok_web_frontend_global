import type { Store } from "solid-js/store";

import type {
  GraphInterface,
  Id,
  Vertex
} from "~/lib/graph/graph";

import { getInEdge } from "./getInEdge";


export function getParentVertexValue(
  graph: Store<GraphInterface>,
  vertex: Vertex,
  meta: Vertex
): Id[] {
  const type = getInEdge(meta, vertex);
  if (!type) {
    return [];
  }
  return (vertex.IN[type] || []).map((edgeId) => graph.edges[edgeId].S);
}
