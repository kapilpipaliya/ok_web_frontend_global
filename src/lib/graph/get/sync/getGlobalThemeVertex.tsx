import type { GraphInterface, Vertex } from "../../graph";

import { evalExpression } from "../../../expression_eval";

export function getGlobalSettingVertex(
  graph: GraphInterface,
): undefined | Vertex {
  const globalSettingId = graph.vertexLabelIdMap.GlobalSetting?.[0];
  if (!globalSettingId) {
    return;
  }
  return graph.vertexes[globalSettingId];
}

export function getGlobalThemeVertex(
  graph: GraphInterface,
): undefined | Vertex {
  const globalSettingVertex = getGlobalSettingVertex(graph);
  if (!globalSettingVertex) {
    return;
  }
  return evalExpression("->$0Theme", {
    graph,
    setGraph: () => {},
    vertexes: [globalSettingVertex],
  })?.[0];
}
