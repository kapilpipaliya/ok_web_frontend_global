import type { GraphData } from "~/lib/types/GraphData";

export function restoreVertexAdjacencyFromEdges(graph: GraphData) {
  for (const vertex of Object.values(graph.vertexes)) {
    vertex.IN = {};
    vertex.OUT = {};
  }

  for (const edge of Object.values(graph.edges)) {
    const start = graph.vertexes[edge.S];
    const end = graph.vertexes[edge.E];

    if (start) {
      if (!start.OUT[edge.T]) {
        start.OUT[edge.T] = [];
      }
      if (!start.OUT[edge.T].includes(edge.id)) {
        start.OUT[edge.T].push(edge.id);
      }
    }

    if (end) {
      if (!end.IN[edge.T]) {
        end.IN[edge.T] = [];
      }
      if (!end.IN[edge.T].includes(edge.id)) {
        end.IN[edge.T].push(edge.id);
      }
    }
  }
}
