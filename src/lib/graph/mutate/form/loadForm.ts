import type { Store } from "solid-js/store";

import type { Id, Vertex } from "~/lib/graph/graph";
import type { GraphInterface } from "~/lib/graph/GraphContext";

export function loadForm(
  graph: Store<GraphInterface>,
  id: Id,
): { error: boolean | string; vertex?: Vertex } {
  if (!graph.vertexes[id]) {
    return { error: "vertex not found" };
  }
  const vertex = graph.vertexes[id];

  return {
    error: false,
    vertex: vertex,
  };
}
