import type { Store } from "solid-js/store";

import type { GraphInterface, Vertex } from "~/lib/graph/graph";

import { getToEdge } from "./getToEdge";

export function getSelectedVertexValue(
  graph: Store<GraphInterface>,
  vertex: Vertex,
  meta: Vertex,
) {
  if (!vertex?.L) return [];
  const type = getToEdge(meta, vertex);
  return (vertex.OUT[type] || []).map((edgeId) => graph.edges[edgeId].E);
}
