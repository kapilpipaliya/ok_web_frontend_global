import type { Store } from "solid-js/store";

import type { GraphInterface, Vertex } from "~/lib/graph/graph";

/**
 * @deprecated
 */

export function getParentVertex(
  path: string[],
  currentVertex: Vertex,
  graph: Store<GraphInterface>
): {
  error: boolean;
  vertex?: Vertex;
} {
  const type = path[path.length - 1].replace("$0", currentVertex.L[0]);
  const edges = currentVertex.IN[type];
  if (!edges || (edges && edges.length !== 1)) {
    return {
      error: true,
    };
  }
  const edge = graph.edges[edges[0]];
  if (edge) {
    const newVertex = graph.vertexes[edge.S];
    if (newVertex) {
      if (path.length > 1) {
        return getParentVertex(path.slice(0, -1), newVertex, graph);
      }
      return {
        error: false,
        vertex: newVertex,
      };
    }
    return {
      error: true,
    };
  }
  return {
    error: true,
  };
}
