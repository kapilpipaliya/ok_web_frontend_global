import type { GraphInterface, Vertex } from "~/lib/graph/graph";

import { getChildVertex } from "~/lib/graph/get/sync/getChildVertex";

export function getComponentLabel(
  graph: GraphInterface,
  vertex: Vertex,
): string | undefined {
  return getChildVertex(graph, ["$0Comp"], vertex).vertex?.P.key;
}
