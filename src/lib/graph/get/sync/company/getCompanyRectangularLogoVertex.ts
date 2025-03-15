import { evalExpression } from "~/lib/expression_eval";
import { getGlobalSettingVertex } from "~/lib/graph/get/sync/theme/getGlobalSettingVertex";

import type { GraphInterface, Vertex } from "../../../graph";

export function getCompanyRectangularLogoVertex(
  graph: GraphInterface,
): undefined | Vertex {
  return evalExpression("->CompanyRectangularLogo", {
    graph,
    vertexes: [getGlobalSettingVertex(graph)],
  })?.[0];
}
