import { evalExpression } from "~/lib/expression_eval";

import type { GraphInterface, Vertex } from "../../../graph";


import {getGlobalSettingVertex} from "~/lib/graph/get/sync/theme/getGlobalSettingVertex";

export function getCompanyRectangularLogoVertex(
  graph: GraphInterface,
): undefined | Vertex {
  return evalExpression("->CompanyRectangularLogo", {
    graph,
    vertexes: [getGlobalSettingVertex(graph)],
  })?.[0];
}
