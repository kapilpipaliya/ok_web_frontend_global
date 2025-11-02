import { evalExpression } from "~/lib/expression_eval";

import type { Vertex } from "~/lib/graph/type/vertex";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";
import { getGlobalStore } from "./getGlobalStore";

export function getMemberVertex(graph: GraphInterface): Vertex | null {
  const globalStore = getGlobalStore(graph);
  const userId = globalStore.P.userId;

  if (userId && graph.vertexes[userId]) {
    return graph.vertexes[userId];
  }

  return null;
}

export function getProfileImageVertex(
  graph: GraphInterface,
): undefined | Vertex {
  const memberVertex = getMemberVertex(graph);

  return evalExpression("->UserProfileImage", {
    graph,
    vertexes: [memberVertex],
  })?.[0];
}
