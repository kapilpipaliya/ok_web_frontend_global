import type { Store } from "solid-js/store";

import type {
  GraphInterface,
  Vertex,
} from "~/lib/graph/graph";


export function getChildVertex(
  graph: Store<GraphInterface>,
  path: string[],
  currentVertex: Vertex,
): {
  error: boolean;
  vertex?: Vertex;
} {
  if (path.length === 0)
    return {
      error: true,
    };

  let type = path[0];
  let filter = "";

  const filterIndex = type.indexOf("[");
  if (filterIndex > -1) {
    filter = type.slice(filterIndex);
    // modify the variable itself
    type = type.slice(0, filterIndex);
  }
  if (type.includes("$0")) {
    if (!currentVertex.L)
      return {
        error: true,
      };
    type = type.replace("$0", currentVertex.L[0]);
  }
  const vertexes = (currentVertex.OUT[type] || []).map(
    (edgeId) => graph.vertexes[graph.edges[edgeId].E],
  );

  if (filter) {
    // TODO:
    // vertexes = vertexes.filter(x=>x.P[IdAttr] === 'component')
  }
  if (vertexes.length !== 1) {
    return {
      error: true,
    };
  }
  const newVertex = vertexes[0];
  if (newVertex) {
    if (path.length > 1) {
      return getChildVertex(graph, path.slice(1), newVertex);
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

export function getParentVertex(
  path: string[],
  currentVertex: Vertex,
  graph: Store<GraphInterface>,
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
