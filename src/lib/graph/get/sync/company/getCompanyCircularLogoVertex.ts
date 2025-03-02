import { evalExpression } from "~/lib/expression_eval";

import type { GraphInterface, Vertex } from "../../../graph";

import { getGlobalSettingVertex } from "../theme/getGlobalThemeVertex";

export function getCompanyCircularLogoVertex(
  graph: GraphInterface,
): undefined | Vertex {
  return evalExpression("->CompanyCircularLogo", {
    graph,
    vertexes: [getGlobalSettingVertex(graph)],
  })?.[0];
}
