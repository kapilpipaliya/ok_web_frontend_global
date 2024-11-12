import { getChildVertex } from "~/lib/graph/get/sync/getChildVertex";
import type { GraphInterface, Vertex } from "~/lib/graph/graph";

export function getComponentLabel(graph: GraphInterface, vertex: Vertex): string | undefined {
  return getChildVertex(graph, ["$0Comp"], vertex).vertex?.P.key;
}
