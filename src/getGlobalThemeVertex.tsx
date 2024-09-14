import type { GraphInterface } from "./lib/graph/graph";

import { evalExpression } from "./lib/expression_eval";

export function getGlobalThemeVertex(graph: GraphInterface) {
  const globalSettingId = graph.vertexLabelIdMap.GlobalSetting?.[0];
  if (!globalSettingId) { return {}; }
  const globalSettingVertex = graph.vertexes[globalSettingId];
  return evalExpression('->$0Theme', {
    graph,
    setGraph: () => { },
    vertexes: [globalSettingVertex],
  })?.[0];
}
