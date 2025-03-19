import type { Vertex } from "~/lib/graph/graph";
import type { GraphInterface } from "~/lib/graph/GraphContext";

export function getGlobalSettingVertex(
  graph: GraphInterface,
): undefined | Vertex {
  const globalSettingId = graph.vertexLabelIdMap.GlobalSetting?.[0];
  if (!globalSettingId) {
    return;
  }
  return graph.vertexes[globalSettingId];
}
