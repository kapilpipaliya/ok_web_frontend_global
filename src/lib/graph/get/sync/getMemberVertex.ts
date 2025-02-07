import type { GraphInterface, Vertex } from "../../graph";

export function getMemberVertex(graph: GraphInterface): Vertex {
  return graph.vertexes["member"] ?? ({P: {}} as Vertex);
}
