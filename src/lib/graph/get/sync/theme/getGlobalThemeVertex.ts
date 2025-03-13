import {evalExpression} from "~/lib/expression_eval";

import type {GraphInterface, Vertex} from "../../../graph";
import {getGlobalSettingVertex} from "~/lib/graph/get/sync/theme/getGlobalSettingVertex";

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
