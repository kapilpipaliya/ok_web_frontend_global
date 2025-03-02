import { evalExpression } from "~/lib/expression_eval";

import type { GraphInterface, Vertex } from "../../../graph";

import { getGlobalSettingVertex } from "../theme/getGlobalThemeVertex";

export function getCompanyRectangularLogoVertex(
  graph: GraphInterface,
): undefined | Vertex {
  return evalExpression("->CompanyRectangularLogo", {
    graph,
    vertexes: [getGlobalSettingVertex(graph)],
  })?.[0];
}
