import { evalExpression } from "~/lib/expression_eval";
import { getGlobalSettingVertex } from "~/lib/graph/get/sync/theme/getGlobalSettingVertex";

import type { GraphInterface, Vertex } from "../../../graph";

export function getCompanySquareLogoVertex(
  graph: GraphInterface,
): undefined | Vertex {
  return evalExpression("->CompanySquareLogo", {
    graph,
    vertexes: [getGlobalSettingVertex(graph)],
  })?.[0];
}
