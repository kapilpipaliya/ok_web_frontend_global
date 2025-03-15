import type { GraphInterface, Vertex } from "~/lib/graph/graph";

export function getGlobalSettingVertex(
  graph: GraphInterface,
): undefined | Vertex {
  const globalSettingId = graph.vertexLabelIdMap.GlobalSetting?.[0];
  if (!globalSettingId) {
    return;
  }
  return graph.vertexes[globalSettingId];
}
