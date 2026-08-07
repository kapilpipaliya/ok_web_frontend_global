import type { ServerResult } from "~/cypher/types/ServerResult";
import type { GraphData } from "~/lib/types/GraphData";

export function stripVertexAdjacency(
  graph?: GraphData | ServerResult["graph"],
) {
  if (!graph?.vertexes) {
    return;
  }

  for (const vertex of Object.values(graph.vertexes)) {
    const stripped = vertex as {
      IN?: typeof vertex.IN;
      OUT?: typeof vertex.OUT;
    };
    delete stripped.IN;
    delete stripped.OUT;
  }
}
