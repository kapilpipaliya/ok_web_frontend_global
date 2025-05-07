import type { Vertex } from "~/lib/graph/graph";

export function sortVertexesByPosition(vertexes: Vertex[]): Vertex[] {
  return vertexes.sort(
    (a: Vertex, b: Vertex) => a.P.displayOrder - b.P.displayOrder,
  );
}
