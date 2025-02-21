import { evalExpression } from "~/lib/expression_eval";

import type { GraphInterface, Vertex } from "../../graph";

export function getMemberVertex(graph: GraphInterface): Vertex {
  return graph.vertexes.member ?? ({ P: {} } as Vertex);
}

export function getProfileImageVertex(
  graph: GraphInterface,
): undefined | Vertex {
  return evalExpression("->UserProfileImage", {
    graph,
    vertexes: [graph.vertexes.member],
  })?.[0];
}
